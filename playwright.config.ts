import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: '.env.test' });
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      AUTH_TRUST_HOST: 'true',
      AUTH_URL: 'http://localhost:3000',
      AUTH_SECRET: 'dummy-secret-for-ci-tests-1234567890',
      PLAYWRIGHT_TEST: '1',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@127.0.0.1:5433/gurmesa_test_db?schema=public'
    }
  },
});
