import { describe, it, expect, vi, afterEach } from 'vitest';

describe('Production Guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('throws an error if PLAYWRIGHT_TEST=1 in production', async () => {
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('PLAYWRIGHT_TEST', '1');

    await expect(import('../../next.config')).rejects.toThrow('PLAYWRIGHT_TEST=1 is not allowed in production');
  });

  it('does not throw if PLAYWRIGHT_TEST is missing in production', async () => {
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('PLAYWRIGHT_TEST', '');

    await expect(import('../../next.config')).resolves.toBeDefined();
  });

  it('refuses to run seed.ts in production', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require('child_process');
    expect(() => {
      execSync('npx tsx scripts/seed.ts', { env: { ...process.env, APP_ENV: 'production' }, stdio: 'ignore' });
    }).toThrow();
  }, 15000);

  describe('isTestMode', () => {
    it('returns true when APP_ENV=test and PLAYWRIGHT_TEST=1', async () => {
      vi.stubEnv('APP_ENV', 'test');
      vi.stubEnv('PLAYWRIGHT_TEST', '1');
      const { isTestMode } = await import('../../lib/test-mode');
      expect(isTestMode()).toBe(true);
    });

    it('returns false otherwise', async () => {
      vi.stubEnv('APP_ENV', 'development');
      vi.stubEnv('PLAYWRIGHT_TEST', '1');
      const { isTestMode } = await import('../../lib/test-mode');
      expect(isTestMode()).toBe(false);
    });
  });
});
