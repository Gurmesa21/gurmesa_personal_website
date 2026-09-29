import crypto from 'crypto';

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
    
    // Lazy cleanup of expired keys to prevent unbounded memory growth
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

const defaultStore = new InMemoryStore();

// Trust assumption: Next.js runs behind a reverse proxy (like Vercel, Cloudflare, Nginx)
// which accurately populates 'x-forwarded-for'. If exposed directly, this header can be spoofed.
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
  
  // IP limit: 5 inquiries per hour
  private readonly IP_LIMIT = 5;
  private readonly IP_WINDOW_MS = 60 * 60 * 1000;
  
  // Email limit: 3 inquiries per hour
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

export const contactRateLimiter = new ContactRateLimiter();
