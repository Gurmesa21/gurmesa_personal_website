import { test, expect } from '@playwright/test';

test.describe('Exactly One H1 Test', () => {
  const publicPaths = [
    '/',
    '/about',
    '/services',
    '/work',
    '/blog',
    '/contact',
  ];
  
  const locales = ['en', 'am', 'om'];

  for (const locale of locales) {
    for (const path of publicPaths) {
      test(`[${locale}] ${path} has exactly one h1`, async ({ page }) => {
        // Set locale cookie if needed or visit /[locale]/path
        // For Next-Intl we can set NEXT_LOCALE cookie or visit directly
        await page.goto(`/${locale}${path}`);
        
        // Count h1 tags
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
      });
    }
  }
});
