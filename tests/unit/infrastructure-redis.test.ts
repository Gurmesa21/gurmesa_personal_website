/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RedisStore,
  InMemoryStore,
  resolveRateLimitStore,
  ContactRateLimiter,
  LoginRateLimiter,
  TestimonialRateLimiter,
  resetDefaultStore,
} from '@/lib/rate-limit';

describe('Upstash Redis Rate Limiter Infrastructure Hardening', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    resetDefaultStore();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetDefaultStore();
  });

  describe('Production configuration validation', () => {
    it('fails configuration explicitly if APP_ENV=production and REDIS_URL is missing', () => {
      vi.stubEnv('APP_ENV', 'production');
      vi.stubEnv('REDIS_URL', '');

      expect(() => resolveRateLimitStore()).toThrow(/REDIS_URL is missing in production environment/i);
    });

    it('falls back to InMemoryStore in development if REDIS_URL is absent', () => {
      vi.stubEnv('APP_ENV', 'development');
      vi.stubEnv('REDIS_URL', '');

      const store = resolveRateLimitStore();
      expect(store).toBeInstanceOf(InMemoryStore);
    });

    it('creates RedisStore when REDIS_URL is present in development or production', () => {
      vi.stubEnv('APP_ENV', 'development');
      vi.stubEnv('REDIS_URL', 'redis://localhost:6379');

      const store = resolveRateLimitStore();
      expect(store).toBeInstanceOf(RedisStore);
      (store as RedisStore).disconnect();
    });
  });

  describe('Redis error listener and fail-open behavior', () => {
    it('attaches error listener without leaking credentials or throwing unhandled events', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Use simulated URL with password
      const store = new RedisStore('redis://:supersecretpass@127.0.0.1:6379');
      const client = store.client;

      // Emit simulated Redis connection error
      client.emit('error', new Error('ECONNREFUSED'));

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMsg = consoleErrorSpy.mock.calls.flat().join(' ');
      expect(loggedMsg).toContain('Connection error');
      expect(loggedMsg).toContain('ECONNREFUSED');
      expect(loggedMsg).not.toContain('supersecretpass');

      consoleErrorSpy.mockRestore();
      store.disconnect();
    });

    it('fails open (returns 1) and logs controlled error when Redis multi.exec fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const store = new RedisStore('redis://localhost:6379');
      // Mock redis.multi to throw or fail
      vi.spyOn(store.client, 'multi').mockImplementation(() => {
        return {
          incr: vi.fn().mockReturnThis(),
          pttl: vi.fn().mockReturnThis(),
          exec: vi.fn().mockRejectedValue(new Error('Upstash quota exceeded (ERR daily limit reached)')),
        } as unknown as ReturnType<typeof store.client.multi>;
      });

      // increment should catch, log, and fail open by returning 1
      const count = await store.increment('test_key', 60000);
      expect(count).toBe(1);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMsg = consoleErrorSpy.mock.calls.flat().join(' ');
      expect(loggedMsg).toContain('failing open to preserve application availability');
      expect(loggedMsg).toContain('quota exceeded');

      consoleErrorSpy.mockRestore();
      store.disconnect();
    });

    it('allows requests to continue through rate limiters when Redis fails open', async () => {
      vi.stubEnv('PLAYWRIGHT_TEST', '0');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Broken store that always returns 1 due to fail-open
      const failingStore = {
        increment: vi.fn().mockResolvedValue(1),
      };

      const contactLimiter = new ContactRateLimiter(failingStore);
      const res = await contactLimiter.check('1.2.3.4', 'user@example.com');
      expect(res.allowed).toBe(true);

      const loginLimiter = new LoginRateLimiter(failingStore);
      const loginRes = await loginLimiter.check('admin@example.com');
      expect(loginRes).toBe(true);

      const testimonialLimiter = new TestimonialRateLimiter(failingStore);
      const testimonialRes = await testimonialLimiter.check('1.2.3.4');
      expect(testimonialRes).toBe(true);

      consoleErrorSpy.mockRestore();
    });

    it('configures TLS options when rediss:// scheme is used', () => {
      const store = new RedisStore('rediss://default:token@region.upstash.io:6379');
      expect((store.client.options as any).tls).toBeDefined();
      store.disconnect();
    });

    it('LoginRateLimiter falls back to in-memory store per instance when primary store fails and enforces 5 attempts', async () => {
      vi.stubEnv('PLAYWRIGHT_TEST', '0');
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const throwingStore = {
        increment: vi.fn().mockRejectedValue(new Error('Redis connection lost')),
      };

      const loginLimiter = new LoginRateLimiter(throwingStore);

      // Attempts 1 to 5 should succeed on fallback in-memory store
      for (let i = 0; i < 5; i++) {
        const allowed = await loginLimiter.check('target-admin@example.com');
        expect(allowed).toBe(true);
      }

      // Attempt 6 must be blocked (never fail open on login)
      const sixthAttempt = await loginLimiter.check('target-admin@example.com');
      expect(sixthAttempt).toBe(false);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnMsg = consoleWarnSpy.mock.calls.flat().join(' ');
      expect(warnMsg).toContain('falling back to in-memory store per instance (never fail open on login)');

      consoleWarnSpy.mockRestore();
    });
  });
});
