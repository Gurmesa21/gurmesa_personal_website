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

  test.beforeEach(() => {
    test.setTimeout(90000);
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
    const uniqueName = `test-avatar-${Date.now()}.png`;
    const uniquePath = path.join(process.cwd(), 'tests', 'e2e', uniqueName);
    fs.writeFileSync(uniquePath, Buffer.from(pngBase64, 'base64'));

    await page.locator('input[type="file"]').setInputFiles(uniquePath);
    await expect(page.locator('text=Uploading...')).toBeVisible();
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator(`.cursor-pointer:has(img[alt="${uniqueName}"])`).dispatchEvent('click');
    await expect(page.locator('text=1 asset selected')).toBeVisible();
    const confirmModalBtn = page.locator('button:has-text("Select Media File")');
    if (await confirmModalBtn.isVisible()) { await confirmModalBtn.click(); }
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

    // Cleanup
    await page.goto('/admin/profile');
    const clearBtn = page.locator('button:has-text("Clear selection")');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.click('button[type="submit"]:has-text("Save Profile")');
      await page.waitForLoadState('networkidle');
    }
    await page.goto('/admin/profile');
    const selectMediaBtn = page.locator('[data-testid="select-media-file-btn"]');
    await selectMediaBtn.click();
    const assetCard = page.locator(`[data-testid="modal-media-card"][data-alt="${uniqueName}"]`);
    page.on('dialog', dialog => dialog.accept());
    await assetCard.hover();
    await assetCard.locator('button.bg-destructive').click();
    await expect(assetCard).toBeHidden();
    if (fs.existsSync(uniquePath)) fs.unlinkSync(uniquePath);
  });

  test('Service Featured Image Render', async ({ page }) => {
    await login(page);
    await page.goto('/admin/services');
    await page.locator('a[data-testid="edit-link"]').first().click();
    const uniqueName = `test-service-${Date.now()}.png`;
    const uniquePath = path.join(process.cwd(), 'tests', 'e2e', uniqueName);
    fs.writeFileSync(uniquePath, Buffer.from(pngBase64, 'base64'));

    await page.locator('input[type="file"]').setInputFiles(uniquePath);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator(`.cursor-pointer:has(img[alt="${uniqueName}"])`).dispatchEvent('click');
    await expect(page.locator('text=1 asset selected')).toBeVisible();
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

    // Cleanup
    await page.goto('/admin/services');
    await page.locator('a[data-testid="edit-link"]').first().click();
    await page.waitForURL(/\/admin\/services\/.*\/edit/);
    const clearBtn = page.locator('button:has-text("Clear selection")');
    await clearBtn.waitFor({ state: 'visible', timeout: 10000 });
    await clearBtn.click();
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/services');

    await page.locator('a[data-testid="edit-link"]').first().click();
    await page.waitForURL(/\/admin\/services\/.*\/edit/);
    const selectMediaBtn = page.locator('[data-testid="select-media-file-btn"]');
    await selectMediaBtn.click();
    const assetCard = page.locator(`[data-testid="modal-media-card"][data-alt="${uniqueName}"]`);
    page.on('dialog', dialog => dialog.accept());
    await assetCard.hover();
    await assetCard.locator('button.bg-destructive').click({ force: true });
    await expect(assetCard).toBeHidden({ timeout: 10000 });
    if (fs.existsSync(uniquePath)) {
      try { fs.unlinkSync(uniquePath); } catch {}
    }
  });

  test('Project Featured Image Render', async ({ page }) => {
    await login(page);
    await page.goto('/admin/projects');
    await page.locator('[data-testid="admin-row"]:has-text("Caching Fintech") a[data-testid="edit-link"]').click();
    const uniqueName = `test-project-${Date.now()}.png`;
    const uniquePath = path.join(process.cwd(), 'tests', 'e2e', uniqueName);
    fs.writeFileSync(uniquePath, Buffer.from(pngBase64, 'base64'));

    await page.locator('input[type="file"]').setInputFiles(uniquePath);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator(`.cursor-pointer:has(img[alt="${uniqueName}"])`).dispatchEvent('click');
    await expect(page.locator('text=1 asset selected')).toBeVisible();
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/projects');

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

    // Cleanup
    await page.goto('/admin/projects');
    await page.locator('[data-testid="admin-row"]:has-text("Caching Fintech") a[data-testid="edit-link"]').click();
    await page.click('button:has-text("Clear selection")');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/projects');
    await page.goto('/admin/projects'); 
    await page.locator('[data-testid="admin-row"]:has-text("Caching Fintech") a[data-testid="edit-link"]').click(); 
    const selectMediaBtn = page.locator('[data-testid="select-media-file-btn"]');
    await selectMediaBtn.click();
    const assetCard = page.locator(`[data-testid="modal-media-card"][data-alt="${uniqueName}"]`);
    page.on('dialog', dialog => dialog.accept());
    await assetCard.hover();
    await assetCard.locator('button.bg-destructive').click();
    await expect(assetCard).toBeHidden();
    if (fs.existsSync(uniquePath)) fs.unlinkSync(uniquePath);
  });

  test('Blog Featured Image Render', async ({ page }) => {
    await login(page);
    await page.goto('/admin/blog');
    await page.locator('a[data-testid="edit-link"]').first().click();
    const uniqueNameBlog = `test-blog-${Date.now()}.png`;
    const uniquePathBlog = path.join(process.cwd(), 'tests', 'e2e', uniqueNameBlog);
    fs.writeFileSync(uniquePathBlog, Buffer.from(pngBase64, 'base64'));

    await page.locator('input[type="file"]').setInputFiles(uniquePathBlog);
    await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
    await page.locator(`.cursor-pointer:has(img[alt="${uniqueNameBlog}"])`).dispatchEvent('click');
    await expect(page.locator('text=1 asset selected')).toBeVisible();
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

    // Cleanup
    await page.goto('/admin/blog');
    await page.locator('a[data-testid="edit-link"]').first().click();
    await page.click('button:has-text("Clear selection")');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.goto('/admin/blog'); 
    await page.locator('a[data-testid="edit-link"]').first().click(); 
    const selectMediaBtn = page.locator('[data-testid="select-media-file-btn"]');
    await selectMediaBtn.click();
    const assetCardBlog = page.locator(`.cursor-pointer:has(img[alt="${uniqueNameBlog}"])`);
    page.on('dialog', dialog => dialog.accept());
    await assetCardBlog.hover();
    await assetCardBlog.locator('button.bg-destructive').click();
    await expect(assetCardBlog).toBeHidden();
    if (fs.existsSync(uniquePathBlog)) fs.unlinkSync(uniquePathBlog);
  });

  test('Video Upload and Render Test', async ({ page }) => {
    await login(page);
    await page.goto('/admin/profile');
    const uniqueName = `test-video-f-${Date.now()}.mp4`;
    const uniquePath = path.join(process.cwd(), 'tests', 'e2e', uniqueName);
    fs.writeFileSync(uniquePath, fs.readFileSync(dummyVideoPath));

    try {
      await page.locator('input[type="file"]').setInputFiles(uniquePath);
      await expect(page.locator('text=Uploading...')).toBeHidden({ timeout: 10000 });
      
      const selectMediaBtn = page.locator('[data-testid="select-media-file-btn"]');
      await selectMediaBtn.click();

      // Verify it uploaded successfully (does not error) and select specific asset by unique alt/name
      const videoCard = page.locator(`[data-testid="media-card"][data-alt="${uniqueName}"]`);
      await expect(videoCard).toBeVisible();

      // Clean up uploaded asset
      page.on('dialog', dialog => dialog.accept());
      await videoCard.hover();
      await videoCard.locator('button.bg-destructive').click();
      await expect(videoCard).toBeHidden({ timeout: 10000 });
    } finally {
      if (fs.existsSync(uniquePath)) fs.unlinkSync(uniquePath);
    }
  });
});
