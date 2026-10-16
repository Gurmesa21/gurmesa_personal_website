import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Redis from 'ioredis';
import { RedisStore, ContactRateLimiter } from '../../lib/rate-limit';

describe('Rate Limiter with Redis', () => {
  let redis: Redis;
  let limiter: ContactRateLimiter;

  beforeAll(async () => {
    // Ensure we connect to actual Redis
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
    redis = new Redis(redisUrl);
    
    // Quick ping to ensure it's alive, or fail fast
    try {
      await redis.ping();
    } catch (err) {
      console.warn('Redis is not available, skipping actual hit confirmation if it fails.');
    }
    
    const store = new RedisStore(redisUrl);
    limiter = new ContactRateLimiter(store);
  });

  afterAll(async () => {
    // flush test keys if possible, then disconnect
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.quit();
  });

  it('11. Rate limiter: the (N+1)th request from one client is rejected while a different client is still accepted', async () => {
    const email1 = 'client1@test.com';
    const email2 = 'client2@test.com';
    const ip = '127.0.0.111'; // Unique IP for this test

    // Disable playwright test bypass
    process.env.PLAYWRIGHT_TEST = '0';

    // Exhaust limit (3 requests)
    for (let i = 0; i < 3; i++) {
      const res = await limiter.check(ip, email1);
      expect(res.allowed).toBe(true);
    }

    // 4th request should fail
    const rejected = await limiter.check(ip, email1);
    expect(rejected.allowed).toBe(false);

    // Verify key in Redis directly
    const keys = await redis.keys('*');
    expect(keys.length).toBeGreaterThan(0);
    console.log('Redis keys created:', keys);

    // Different email, same IP (assuming IP limit is 5, not exhausted yet)
    const accepted = await limiter.check(ip, email2);
    expect(accepted.allowed).toBe(true);
  });
});
