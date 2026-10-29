import { test, expect } from '@playwright/test';

test.describe('Testimonials Moderation & Rate Limits', () => {
  test('unauthorized testimonials are not public', async ({ page }) => {
    // 1. Submit a testimonial
    await page.goto('/en/testimonials');
    await page.fill('input[name="name"]', 'Spammy McSpamface');
    await page.fill('textarea[name="text"]', 'Buy my crypto today! This text is longer than twenty.');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Thank You!')).toBeVisible();

    // 2. Refresh the page, it should not be listed
    await page.goto('/en/testimonials');
    await expect(page.locator('text=Buy my crypto today!')).toBeHidden();
  });

  test('honeypot traps spam bots', async ({ page }) => {
    await page.goto('/en/testimonials');
    
    // Fill honeypot
    await page.evaluate(() => {
      const el = document.getElementById('website_url') as HTMLInputElement;
      if (el) el.value = 'http://spam.com';
    });

    await page.fill('input[name="name"]', 'Bot User');
    await page.fill('textarea[name="text"]', 'Spam comment that satisfies the twenty character minimum.');
    await page.click('button[type="submit"]');

    // Should pretend to succeed but not actually save
    await expect(page.locator('text=Thank You!')).toBeVisible();
  });


});
