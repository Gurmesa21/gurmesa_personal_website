import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Part F - Public Media Rendering', () => {
  const dummyImagePath = path.join(process.cwd(), 'tests', 'e2e', 'test-avatar-f.png');
  const dummyVideoPath = path.join(process.cwd(), 'tests', 'e2e', 'test-video-f.mp4');
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  test.beforeAll(() => {
    fs.writeFileSync(dummyImagePath, Buffer.from(pngBase64, 'base64'));
    // A tiny valid mp4 file (just headers, essentially)
    const mp4Hex = '00000018667479706D703432000000006D70343269736F6D0000000866726565000000086D646174';
    fs.writeFileSync(dummyVideoPath, Buffer.from(mp4Hex, 'hex'));
  });

  test.afterAll(() => {
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
    if (fs.existsSync(dummyVideoPath)) fs.unlinkSync(dummyVideoPath);
  });

  async function login(page: import('@playwright/test').Page) {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  }

  test('Profile Avatar Render', async ({ page }) => {
    await login(page);
    await page.goto('/admin/profile');
    await page.locator('input[type="file"]').setInputFiles(dummyImagePath);
    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator('.grid > .relative').first().click();
    await page.click('button[type="submit"]:has-text("Save Profile")');
    await page.waitForLoadState('networkidle');

    // Unauthenticated visitor
    const visitorContext = await page.context().browser()!.newContext();
    const visitorPage = await visitorContext.newPage();
    
    await visitorPage.goto('/about');
    await expect(visitorPage.locator('.w-48.h-48 img')).toBeVisible();
    
    const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partF', 'screenshots');
    fs.mkdirSync(outDir, { recursive: true });
    await visitorPage.screenshot({ path: path.join(outDir, 'proof-avatar.png') });
    await visitorContext.close();
  });

  test('Service Featured Image Render', async ({ page }) => {
    await login(page);
    await page.goto('/admin/services');
    await page.locator('a[href*="/edit"]').first().click();
    await page.locator('input[type="file"]').setInputFiles(dummyImagePath);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator('.grid > .relative').first().click();
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const visitorContext = await page.context().browser()!.newContext();
    const visitorPage = await visitorContext.newPage();
    
    // Index page
    await visitorPage.goto('/services');
    await expect(visitorPage.locator('img.object-cover').first()).toBeVisible();
    
    // Detail page
    await visitorPage.locator('a:has-text("View Details")').first().click();
    await expect(visitorPage.locator('img.object-cover').first()).toBeVisible();
    
    const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partF', 'screenshots');
    await visitorPage.screenshot({ path: path.join(outDir, 'proof-service.png') });
    await visitorContext.close();
  });

  test('Project Featured Image Render', async ({ page }) => {
    await login(page);
    await page.goto('/admin/projects');
    await page.locator('a[href*="/edit"]').first().click();
    await page.locator('input[type="file"]').setInputFiles(dummyImagePath);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator('.grid > .relative').first().click();
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const visitorContext = await page.context().browser()!.newContext();
    const visitorPage = await visitorContext.newPage();
    
    // Index page
    await visitorPage.goto('/work');
    await expect(visitorPage.locator('img.object-cover').first()).toBeVisible();
    
    // Detail page
    await visitorPage.locator('a:has-text("Read Case Study")').first().click();
    await expect(visitorPage.locator('img.object-cover').first()).toBeVisible();
    
    const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partF', 'screenshots');
    await visitorPage.screenshot({ path: path.join(outDir, 'proof-project.png') });
    await visitorContext.close();
  });

  test('Blog Featured Image Render', async ({ page }) => {
    await login(page);
    await page.goto('/admin/blog');
    await page.locator('a[href*="/edit"]').first().click();
    await page.locator('input[type="file"]').setInputFiles(dummyImagePath);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator('.grid > .relative').first().click();
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const visitorContext = await page.context().browser()!.newContext();
    const visitorPage = await visitorContext.newPage();
    
    // Index page
    await visitorPage.goto('/blog');
    await expect(visitorPage.locator('img.object-cover').first()).toBeVisible();
    
    // Detail page
    await visitorPage.locator('a.hover\\:underline').first().click();
    await expect(visitorPage.locator('img.object-cover').first()).toBeVisible();
    
    const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partF', 'screenshots');
    await visitorPage.screenshot({ path: path.join(outDir, 'proof-blog.png') });
    await visitorContext.close();
  });

  test('Video Upload and Render Test', async ({ page }) => {
    await login(page);
    await page.goto('/admin/profile');
    await page.locator('input[type="file"]').setInputFiles(dummyVideoPath);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    
    // Verify it uploaded successfully (does not error)
    const firstMediaCard = page.locator('.grid > .relative').first();
    await expect(firstMediaCard).toBeVisible();
  });
});
