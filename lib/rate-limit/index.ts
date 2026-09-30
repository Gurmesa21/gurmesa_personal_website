import crypto from 'crypto';
import Redis from 'ioredis';

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<number>;
}

// In-memory implementation (cleared on server restart)
export class InMemoryStore implements RateLimitStore {
  private hits = new Map<string, { count: number; expiresAt: number }>();

  async increment(key: string, windowMs: number): Promise<number> {
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
    this.redis = new Redis(url);
  }

  async increment(key: string, windowMs: number): Promise<number> {
    const multi = this.redis.multi();
    multi.incr(key);
    multi.pttl(key);
    const results = await multi.exec();
    
    if (!results) return 1;

    const count = results[0][1] as number;
    const ttl = results[1][1] as number;

    if (ttl === -1 || ttl === -2) {
      await this.redis.pexpire(key, windowMs);
    }
    
    return count;
  }
}

const defaultStore = process.env.REDIS_URL ? new RedisStore(process.env.REDIS_URL) : new InMemoryStore();

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

  constructor(store: RateLimitStore = defaultStore) {
    this.store = store;
  }

  async check(ip: string, email: string): Promise<{ allowed: boolean; reason?: string }> {
    if (process.env.PLAYWRIGHT_TEST === '1') {
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
  
  private readonly EMAIL_LIMIT = 5;
  private readonly EMAIL_WINDOW_MS = 5 * 60 * 1000; // 5 attempts per 5 minutes

  constructor(store: RateLimitStore = defaultStore) {
    this.store = store;
  }

  async check(email: string): Promise<boolean> {
    if (process.env.PLAYWRIGHT_TEST === '1') {
      return true;
    }

    const hashedEmail = hashKey(`login:${email.toLowerCase()}`);
    const count = await this.store.increment(hashedEmail, this.EMAIL_WINDOW_MS);
    return count <= this.EMAIL_LIMIT;
  }
}

export const contactRateLimiter = new ContactRateLimiter();
export const loginRateLimiter = new LoginRateLimiter();
