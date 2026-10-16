import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Redis from 'ioredis';
import { RedisStore, TestimonialRateLimiter } from '../../lib/rate-limit/index';

describe('Testimonial Rate Limiter with Redis', () => {
  let redis: Redis;
  let limiter: TestimonialRateLimiter;

  beforeAll(async () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
    redis = new Redis(redisUrl);
    
    try {
      await redis.ping();
    } catch (err) {
      console.warn('Redis is not available');
    }
    
    const store = new RedisStore(redisUrl);
    limiter = new TestimonialRateLimiter(store);
  });

  afterAll(async () => {
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.quit();
  });

  it('12. Testimonial Rate limiter: the (N+1)th request from one IP is rejected while a different IP is still accepted', async () => {
    const ip1 = '127.0.0.10';
    const ip2 = '127.0.0.11';

    // Disable playwright test bypass
    process.env.PLAYWRIGHT_TEST = '0';

    // Exhaust limit (3 requests)
    for (let i = 0; i < 3; i++) {
      const res = await limiter.check(ip1);
      expect(res).toBe(true);
    }

    // 4th request should fail
    const rejected = await limiter.check(ip1);
    expect(rejected).toBe(false);

    // Verify key in Redis directly
    const keys = await redis.keys('*');
    expect(keys.length).toBeGreaterThan(0);

    // Different IP
    const accepted = await limiter.check(ip2);
    expect(accepted).toBe(true);
  });
});
