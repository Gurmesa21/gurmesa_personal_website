import { test, expect } from '@playwright/test';

test.describe('Exactly One H1 Test', () => {
  const publicPaths = [
    '/',
    '/about',
    '/services',
    '/services/web-development',
    '/work',
    '/work/os-dashboard',
    '/blog',
    '/blog/first-post',
    '/contact',
    '/testimonials',
    '/privacy',
    '/terms',
    '/non-existent-404-page',
  ];
  
  const locales = ['en', 'am', 'om'];

  for (const locale of locales) {
    for (const path of publicPaths) {
      test(`[${locale}] ${path} has exactly one h1`, async ({ page }) => {
        await page.goto(`/${locale}${path}`);
        
        // Count h1 tags
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
      });
    }
  }
});
