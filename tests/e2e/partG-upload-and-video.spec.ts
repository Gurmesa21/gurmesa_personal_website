import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Part G - Media Upload Limits and Video Rendering', () => {
  const dummyOversizedVideoPath = path.join(process.cwd(), 'tests', 'e2e', 'test-oversized-video-g.mp4');

  test.beforeAll(() => {
    // Generate a ~26MB MP4 to test the oversized limit
    const oversizedBuffer = Buffer.alloc(26 * 1024 * 1024);
    oversizedBuffer.write('00000018667479706D703432000000006D70343269736F6D0000000866726565000000086D646174', 0, 'hex');
    fs.writeFileSync(dummyOversizedVideoPath, oversizedBuffer);
  });

  test.afterAll(() => {
    if (fs.existsSync(dummyOversizedVideoPath)) fs.unlinkSync(dummyOversizedVideoPath);
  });

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  }

  function createDummyVideo(filePath: string) {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    largeBuffer.write('00000018667479706D703432000000006D70343269736F6D0000000866726565000000086D646174', 0, 'hex');
    fs.writeFileSync(filePath, largeBuffer);
  }

  test('Upload file size limits (6MB succeeds, 26MB rejected)', async ({ page }) => {
    await login(page);
    await page.goto('/admin/profile');

    // 1. Upload oversized video
    await page.locator('input[type="file"]').setInputFiles(dummyOversizedVideoPath);
    await expect(page.locator('.text-destructive')).toContainText('exceeds the 25MB limit', { timeout: 10000 });

    // 2. Upload 6MB video with unique name
    const uniqueName = `test-large-video-g1-${Date.now()}.mp4`;
    const uniquePath = path.join(process.cwd(), 'tests', 'e2e', uniqueName);
    createDummyVideo(uniquePath);

    try {
      await page.locator('input[type="file"]').setInputFiles(uniquePath);
      await expect(page.locator('text=Uploading...')).toBeVisible();
      await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 15000 });
      
      // Verify it uploaded successfully (does not error)
      const uploadedCard = page.locator(`[data-testid="media-card"][data-alt="${uniqueName}"]`);
      await expect(uploadedCard).toBeVisible();

      // Clean up uploaded asset
      page.on('dialog', dialog => dialog.accept());
      await uploadedCard.hover();
      await uploadedCard.locator('button').click();
      await expect(uploadedCard).toBeHidden({ timeout: 10000 });
    } finally {
      if (fs.existsSync(uniquePath)) fs.unlinkSync(uniquePath);
    }
  });

  test('Video rendering on public pages', async ({ page }) => {
    await login(page);
    await page.goto('/admin/profile');
    
    // Select the large video with unique name
    const uniqueName = `test-large-video-g2-${Date.now()}.mp4`;
    const uniquePath = path.join(process.cwd(), 'tests', 'e2e', uniqueName);
    createDummyVideo(uniquePath);

    try {
      await page.locator('input[type="file"]').setInputFiles(uniquePath);
      await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 15000 });
      
      const uploadedCard = page.locator(`[data-testid="media-card"][data-alt="${uniqueName}"]`);
      await uploadedCard.dispatchEvent('click');
      await expect(page.locator('text=1 asset selected')).toBeVisible();
      
      // Submit profile form
      await page.click('button[type="submit"]:has-text("Save Profile")');
      await page.waitForLoadState('networkidle');

      // Verify on public page
      const visitorContext = await page.context().browser()!.newContext();
      const visitorPage = await visitorContext.newPage();
      
      await visitorPage.goto('/about');
      
      // It should render a <video> element instead of <img>
      const videoLocator = visitorPage.locator('video.object-cover');
      await expect(videoLocator).toBeVisible();
      
      await visitorContext.close();

      // Cleanup: clear selection and delete uploaded asset
      await page.goto('/admin/profile');
      const clearBtn = page.locator('button:has-text("Clear selection")');
      if (await clearBtn.isVisible()) {
        await clearBtn.click();
        await page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) form.requestSubmit();
        });
        await page.waitForTimeout(1000);
      }

      page.on('dialog', dialog => dialog.accept());
      const cardToDelete = page.locator(`[data-testid="media-card"][data-alt="${uniqueName}"]`);
      if (await cardToDelete.count() > 0) {
        await cardToDelete.hover();
        await cardToDelete.locator('button').click();
        await expect(cardToDelete).toBeHidden({ timeout: 10000 });
      }
    } finally {
      if (fs.existsSync(uniquePath)) fs.unlinkSync(uniquePath);
    }
  });
});
