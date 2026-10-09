import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Part G - Media Upload Limits and Video Rendering', () => {
  const dummyLargeVideoPath = path.join(process.cwd(), 'tests', 'e2e', 'test-large-video-g.mp4');
  const dummyOversizedVideoPath = path.join(process.cwd(), 'tests', 'e2e', 'test-oversized-video-g.mp4');

  test.beforeAll(() => {
    // Generate a ~6MB MP4
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    // Add ftyp header so validation.ts sees it as MP4
    largeBuffer.write('00000018667479706D703432000000006D70343269736F6D0000000866726565000000086D646174', 0, 'hex');
    fs.writeFileSync(dummyLargeVideoPath, largeBuffer);

    // Generate a ~26MB MP4 to test the oversized limit
    const oversizedBuffer = Buffer.alloc(26 * 1024 * 1024);
    oversizedBuffer.write('00000018667479706D703432000000006D70343269736F6D0000000866726565000000086D646174', 0, 'hex');
    fs.writeFileSync(dummyOversizedVideoPath, oversizedBuffer);
  });

  test.afterAll(() => {
    if (fs.existsSync(dummyLargeVideoPath)) fs.unlinkSync(dummyLargeVideoPath);
    if (fs.existsSync(dummyOversizedVideoPath)) fs.unlinkSync(dummyOversizedVideoPath);
  });

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  }

  test('Upload file size limits (6MB succeeds, 26MB rejected)', async ({ page }) => {
    await login(page);
    await page.goto('/admin/profile');

    // 1. Upload oversized video
    await page.locator('input[type="file"]').setInputFiles(dummyOversizedVideoPath);
    await expect(page.locator('.text-destructive')).toContainText('exceeds the 25MB limit', { timeout: 10000 });

    // 2. Upload 6MB video
    await page.locator('input[type="file"]').setInputFiles(dummyLargeVideoPath);
    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 15000 });
    
    // Verify it uploaded successfully (does not error)
    const firstMediaCard = page.locator('.grid > .relative').first();
    await expect(firstMediaCard).toBeVisible();
  });

  test('Video rendering on public pages', async ({ page }) => {
    await login(page);
    await page.goto('/admin/profile');
    
    // Select the large video
    await page.locator('input[type="file"]').setInputFiles(dummyLargeVideoPath);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 15000 });
    
    await page.locator('.grid > .relative').first().click();
    
    // Wait for the hidden input to be updated by React
    await page.waitForTimeout(2000);
    
    
    // Force submit
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });
    
    await page.waitForTimeout(3000);

    // Verify on public page
    const visitorContext = await page.context().browser()!.newContext();
    const visitorPage = await visitorContext.newPage();
    
    await visitorPage.goto('/about');
    
    // It should render a <video> element instead of <img>
    const videoLocator = visitorPage.locator('video.object-cover');
    await expect(videoLocator).toBeVisible();
    
    await visitorContext.close();
  });
});
