import crypto from 'crypto';
import Redis from 'ioredis';
import { isTestMode } from '../test-mode';

export interface RateLimitStore {
  increment(key: string, windowMs: number, options?: { throwOnError?: boolean }): Promise<number>;
}

// In-memory implementation (cleared on server restart)
export class InMemoryStore implements RateLimitStore {
  private hits = new Map<string, { count: number; expiresAt: number }>();

  async increment(key: string, windowMs: number, _options?: { throwOnError?: boolean }): Promise<number> {
    const now = Date.now();
    const record = this.hits.get(key);

    if (record && record.expiresAt > now) {
      record.count += 1;
      this.hits.set(key, record);
      return record.count;
    }

    this.hits.set(key, { count: 1, expiresAt: now + windowMs });
    
    if (Math.random() < 0.05) {
      for (const [k, v] of this.hits.entries()) {
        if (v.expiresAt <= now) {
          this.hits.delete(k);
        }
      }
    }

    return 1;
  }
}

// Redis implementation
export class RedisStore implements RateLimitStore {
  private redis: Redis;

  constructor(url: string) {
    const isTls = url.startsWith('rediss://');
    const options: any = {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: false,
    };
    if (isTls) {
      options.tls = {
        rejectUnauthorized: false
      };
    }

    // Standard Redis TCP/TLS connection using ioredis
    this.redis = new Redis(url, options);

    // Redis error listener: log controlled, useful error information without exposing credentials or REDIS_URL
    this.redis.on('error', (err: any) => {
      const msg = err && typeof err.message === 'string' ? err.message : 'Unknown error';
      console.error(`[RateLimit Redis] Connection error: ${msg}`);
    });
  }

  async increment(key: string, windowMs: number, options?: { throwOnError?: boolean }): Promise<number> {
    try {
      const multi = this.redis.multi();
      multi.incr(key);
      multi.pttl(key);
      const results = await multi.exec();

      if (!results) {
        if (options?.throwOnError) {
          throw new Error('Multi command returned null');
        }
        console.warn('[RateLimit Redis] Multi command returned null; failing open to preserve application availability.');
        return 1;
      }

      const [incrErr, incrResult] = results[0];
      const [pttlErr, pttlResult] = results[1];

      if (incrErr) throw incrErr;
      if (pttlErr) throw pttlErr;

      const count = incrResult as number;
      const ttl = pttlResult as number;

      if (ttl === -1 || ttl === -2) {
        try {
          await this.redis.pexpire(key, windowMs);
        } catch (pexpireErr: any) {
          console.warn('[RateLimit Redis] Failed to set pexpire:', pexpireErr?.message || 'Unknown error');
        }
      }

      return count;
    } catch (err: any) {
      if (options?.throwOnError) {
        throw err;
      }
      // Operational trade-off: fail-open behavior preserves application availability
      // but temporarily reduces rate-limit enforcement while Redis is unavailable or quota is exhausted.
      const errorMsg = err && typeof err.message === 'string' ? err.message : 'Unknown error';
      console.error(
        `[RateLimit Redis] Operation failed (${errorMsg}); failing open to preserve application availability.`
      );
      return 1;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }

  get client(): Redis {
    return this.redis;
  }
}

export function resolveRateLimitStore(): RateLimitStore {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (process.env.APP_ENV === 'production') {
    if (!redisUrl) {
      throw new Error(
        'REDIS_URL is missing in production environment. A valid Redis connection string is required for distributed rate limiting.'
      );
    }
    return new RedisStore(redisUrl);
  }

  if (redisUrl) {
    return new RedisStore(redisUrl);
  }

  return new InMemoryStore();
}

let defaultStoreInstance: RateLimitStore | null = null;

export function getDefaultStore(): RateLimitStore {
  if (!defaultStoreInstance) {
    defaultStoreInstance = resolveRateLimitStore();
  }
  return defaultStoreInstance;
}

export function resetDefaultStore(): void {
  defaultStoreInstance = null;
}

export function getIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown-ip';
}

function hashKey(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export class ContactRateLimiter {
  private store: RateLimitStore;
  
  private readonly IP_LIMIT = 5;
  private readonly IP_WINDOW_MS = 60 * 60 * 1000;
  
  private readonly EMAIL_LIMIT = 3;
  private readonly EMAIL_WINDOW_MS = 60 * 60 * 1000;

  constructor(store?: RateLimitStore) {
    this.store = store ?? getDefaultStore();
  }

  async check(ip: string, email: string): Promise<{ allowed: boolean; reason?: string }> {
    if (isTestMode()) {
      return { allowed: true };
    }

    const hashedIp = hashKey(`ip:${ip}`);
    const ipCount = await this.store.increment(hashedIp, this.IP_WINDOW_MS);
    if (ipCount > this.IP_LIMIT) {
      return { allowed: false, reason: 'Too many requests from this IP' };
    }

    const hashedEmail = hashKey(`email:${email.toLowerCase()}`);
    const emailCount = await this.store.increment(hashedEmail, this.EMAIL_WINDOW_MS);
    if (emailCount > this.EMAIL_LIMIT) {
      return { allowed: false, reason: 'Too many requests for this email' };
    }

    return { allowed: true };
  }
}

export class LoginRateLimiter {
  private store: RateLimitStore;
  private fallbackStore = new InMemoryStore();
  
  private readonly EMAIL_LIMIT = 5;
  private readonly EMAIL_WINDOW_MS = 5 * 60 * 1000; // 5 attempts per 5 minutes

  constructor(store?: RateLimitStore) {
    this.store = store ?? getDefaultStore();
  }

  async check(email: string): Promise<boolean> {
    if (isTestMode()) {
      return true;
    }

    const hashedEmail = hashKey(`login:${email.toLowerCase()}`);
    try {
      const count = await this.store.increment(hashedEmail, this.EMAIL_WINDOW_MS, { throwOnError: true });
      return count <= this.EMAIL_LIMIT;
    } catch (err: any) {
      console.warn(
        `[LoginRateLimiter] Primary rate limit store failed (${err?.message || 'Unknown error'}); falling back to in-memory store per instance (never fail open on login).`
      );
      const count = await this.fallbackStore.increment(hashedEmail, this.EMAIL_WINDOW_MS);
      return count <= this.EMAIL_LIMIT;
    }
  }
}

export const contactRateLimiter = new ContactRateLimiter();
export const loginRateLimiter = new LoginRateLimiter();

export class TestimonialRateLimiter {
  private store: RateLimitStore;
  private readonly LIMIT = 3;
  private readonly WINDOW_MS = 60 * 60 * 1000;

  constructor(store?: RateLimitStore) {
    this.store = store ?? getDefaultStore();
  }

  async check(ip: string): Promise<boolean> {
    if (isTestMode()) return true;
    const hashed = hashKey(`testimonial:${ip}`);
    const count = await this.store.increment(hashed, this.WINDOW_MS);
    return count <= this.LIMIT;
  }
}

export const testimonialRateLimiter = new TestimonialRateLimiter();

export class BlogLikeRateLimiter {
  private store: RateLimitStore;
  private readonly LIMIT = 10;
  private readonly WINDOW_MS = 60 * 1000; // 10 likes per minute

  constructor(store?: RateLimitStore) {
    this.store = store ?? getDefaultStore();
  }

  async check(ip: string, voterHash: string): Promise<boolean> {
    if (isTestMode()) return true;
    const hashedIp = hashKey(`like_ip:${ip}`);
    const hashedVoter = hashKey(`like_voter:${voterHash}`);
    
    const countIp = await this.store.increment(hashedIp, this.WINDOW_MS);
    const countVoter = await this.store.increment(hashedVoter, this.WINDOW_MS);
    
    return countIp <= this.LIMIT && countVoter <= this.LIMIT;
  }
}

export const blogLikeRateLimiter = new BlogLikeRateLimiter();

export class CommentRateLimiter {
  private store: RateLimitStore;
  private readonly LIMIT = 5;
  private readonly WINDOW_MS = 60 * 60 * 1000; // 5 comments per hour

  constructor(store?: RateLimitStore) {
    this.store = store ?? getDefaultStore();
  }

  async check(ip: string): Promise<boolean> {
    if (isTestMode()) return true;
    const hashedIp = hashKey(`comment_ip:${ip}`);
    const countIp = await this.store.increment(hashedIp, this.WINDOW_MS);
    return countIp <= this.LIMIT;
  }
}

export const commentRateLimiter = new CommentRateLimiter();
