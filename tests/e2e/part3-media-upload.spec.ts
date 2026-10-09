import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Part 3 - Media Upload Widget', () => {
  const dummyImagePath = path.join(process.cwd(), 'tests', 'e2e', 'test-avatar.png');
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  test.beforeAll(() => {
    // Create a 1x1 transparent PNG for testing
    fs.writeFileSync(dummyImagePath, Buffer.from(pngBase64, 'base64'));
  });

  test.afterAll(() => {
    // Clean up
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
  });

  test('Upload avatar in Profile edit and verify on public page', async ({ page }) => {
    // 1. Log in
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // 2. Go to Profile edit
    await page.goto('/admin/profile');

    // 3. Use the MediaPicker to upload a new image
    // Find the file input within the MediaPicker (it's hidden, but playwright can set input files)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(dummyImagePath);

    // Wait for the upload to complete and the new image to appear in the grid
    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });

    // Click the newly uploaded image in the grid to select it
    // The newly uploaded image should be the first one (since it's ordered by createdAt desc)
    const firstMediaCard = page.locator('.grid > .relative').first();
    await firstMediaCard.click();

    // Verify it's selected (shows '1 asset selected')
    await expect(page.locator('text=1 asset selected')).toBeVisible();

    // Submit the form
    await page.click('button[type="submit"]:has-text("Save Profile")');
    await page.waitForLoadState('networkidle');

    // 4. Go to the public About page
    await page.goto('/about');

    // 5. Verify the avatar image renders
    // Look for the image inside the w-48 h-48 container
    const avatarImage = page.locator('.w-48.h-48 img');
    await expect(avatarImage).toBeVisible();

    // Take a screenshot as proof
    const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partD', 'part3');
    fs.mkdirSync(outDir, { recursive: true });
    await page.screenshot({ path: path.join(outDir, 'proof-avatar-rendered.png') });
  });
});
