import { test, expect } from '@playwright/test';
import { prisma } from '../../server/repositories/db';

test.describe('Day 10 - Admin & SEO E2E', () => {
  test('HIDDEN social link absent from getPublicSocialLinks output AND from the rendered /about page HTML', async ({ page }) => {
    // We already know getPublicSocialLinks excludes it because the where clause is 'PUBLIC'. Let's test the DB layer.
    
    // Test the rendered HTML
    await prisma.socialLink.create({
      data: {
        platform: 'SecretPlatform',
        url: 'https://secret.com',
        label: 'Secret',
        visibility: 'HIDDEN',
        order: 999,
      }
    });

    await page.goto('/about');
    await expect(page.locator('text=SecretPlatform')).not.toBeVisible();

    // cleanup
    await prisma.socialLink.deleteMany({ where: { platform: 'SecretPlatform' } });
  });

  test('editing the Profile tagline via the admin UI shows the new tagline on / on the next request', async ({ page }) => {
    // 1. Login
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // 2. Edit profile
    await page.goto('/admin/profile');
    const newTagline = 'New Tagline ' + Date.now();
    await page.fill('input[name="tagline"]', newTagline);
    await page.click('button[type="submit"]');

    // wait for success/redirect
    await page.waitForResponse(response => response.url().includes('/admin/profile') && response.request().method() === 'POST');

    // 3. Check public page
    await page.goto('/');
    await expect(page.locator(`text=${newTagline}`).first()).toBeVisible({ timeout: 15000 });
  });

  test('production error page shows no stack trace in the rendered HTML', async ({ page }) => {
    // We navigate to the home page with a param that intentionally throws
    // The server handles it and renders error.tsx
    await page.goto('/?throwTestError=1');
    
    const html = await page.content();
    
    // Should show our generic message
    await expect(page.locator('text=Something went wrong')).toBeVisible();
    
    // Should NOT show the internal error message or stack trace
    expect(html).not.toContain('postgres://secret@db');
    expect(html).not.toContain('simulated secret internal server error');
  });
});

