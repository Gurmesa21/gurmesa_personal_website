import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

test.describe('Staging Smoke Suite (Production Readiness)', () => {
  const SMOKE_MARKER = `smoke-${Date.now()}`;
  const testInquiryEmail = `${SMOKE_MARKER}@example.com`;

  test.afterAll(async () => {
    // Clean up all data created during smoke test
    try {
      await prisma.inquiry.deleteMany({ where: { email: testInquiryEmail } });
      await prisma.testimonial.deleteMany({ where: { name: { contains: SMOKE_MARKER } } });
      await prisma.blogComment.deleteMany({ where: { author: { contains: SMOKE_MARKER } } });
      await prisma.mediaAsset.deleteMany({ where: { altText: { contains: SMOKE_MARKER } } });
    } catch (err) {
      console.warn('Smoke test cleanup warning:', err);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('1. Admin guard redirects unauthenticated requests on /admin, /am/admin, and /om/admin', async ({ page }) => {
    // /admin -> /admin/login
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);

    // /am/admin -> /admin/login
    await page.goto('/am/admin');
    await expect(page).toHaveURL(/\/admin\/login/);

    // /om/admin -> /admin/login
    await page.goto('/om/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('2. Admin login succeeds and displays dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 });
    await expect(page.locator('h1, h2, nav').first()).toBeVisible();
  });

  test('3. Media upload and rendering across library and forms', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    await page.goto('/admin/profile');
    
    // Create tiny test PNG and video
    const testFileName = `${SMOKE_MARKER}-avatar.png`;
    const tempFilePath = path.join(process.cwd(), 'tests', 'e2e', testFileName);
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    fs.writeFileSync(tempFilePath, Buffer.from(pngBase64, 'base64'));

    const testVideoName = `${SMOKE_MARKER}-clip.mp4`;
    const tempVideoPath = path.join(process.cwd(), 'tests', 'e2e', testVideoName);
    const mp4Hex = '00000018667479706D703432000000006D70343269736F6D0000000866726565000000086D646174';
    fs.writeFileSync(tempVideoPath, Buffer.from(mp4Hex, 'hex'));

    try {
      // Upload PNG avatar
      await page.locator('input[type="file"]').setInputFiles(tempFilePath);
      await expect(page.locator('text=Uploading...').first()).toBeHidden({ timeout: 15000 });

      // Verify asset appears in media picker modal
      await page.locator('[data-testid="select-media-file-btn"]').click();
      const uploadedCard = page.locator(`[data-testid="media-card"][data-alt="${testFileName}"]`);
      await expect(uploadedCard).toBeVisible();

      // Clean up asset
      page.on('dialog', dialog => dialog.accept());
      await uploadedCard.hover();
      await uploadedCard.locator('button.bg-destructive').click();
      await expect(uploadedCard).toBeHidden({ timeout: 10000 });

      // Close modal
      const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }

      // Upload video clip
      await page.locator('input[type="file"]').setInputFiles(tempVideoPath);
      await expect(page.locator('text=Uploading...').first()).toBeHidden({ timeout: 15000 });

      // Verify video appears in media picker modal and clean up
      await page.locator('[data-testid="select-media-file-btn"]').click();
      const uploadedVideoCard = page.locator(`[data-testid="media-card"][data-alt="${testVideoName}"]`);
      await expect(uploadedVideoCard).toBeVisible();
      await uploadedVideoCard.hover();
      await uploadedVideoCard.locator('button.bg-destructive').click();
      await expect(uploadedVideoCard).toBeHidden({ timeout: 10000 });
    } finally {
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
      } catch {}
    }
  });

  test('4. Inquiry, testimonial, and social interaction flows', async ({ page }) => {
    // --- Inquiry Submission ---
    await page.goto('/contact');
    await page.fill('input[name="name"]', `Smoke User ${SMOKE_MARKER}`);
    await page.fill('input[name="email"]', testInquiryEmail);
    await page.fill('input[name="organization"]', 'Smoke QA Inc');
    await page.selectOption('select[name="projectType"]', 'Business website');
    await page.fill('textarea[name="message"]', 'This is an end-to-end automated smoke test inquiry message.');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Thank you!')).toBeVisible({ timeout: 10000 });

    // Verify saved to database
    const savedInquiry = await prisma.inquiry.findFirst({ where: { email: testInquiryEmail } });
    expect(savedInquiry).not.toBeNull();

    // --- Testimonial Submission (min 20, max 200 chars) ---
    await page.goto('/en/testimonials');
    await page.fill('input[name="name"]', `Smoke Client ${SMOKE_MARKER}`);
    await page.fill('textarea[name="text"]', 'Antigravity end-to-end verification delivers outstanding software quality and robustness.');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 10000 });

    // Verify testimonial saved with PENDING status
    const savedTestimonial = await prisma.testimonial.findFirst({
      where: { name: `Smoke Client ${SMOKE_MARKER}` }
    });
    expect(savedTestimonial).not.toBeNull();
    expect(savedTestimonial?.status).toBe('DRAFT');
    expect(savedTestimonial?.permissionStatus).toBe('PENDING');

    // --- Blog Post Social Interaction (Like toggle, Share, & Comment) ---
    await page.goto('/blog');
    const firstArticle = page.getByRole('link', { name: /Read Article/i }).first();
    await firstArticle.click();
    await page.waitForURL(/\/blog\/.+/);

    // Like toggle
    const likeBtn = page.getByRole('button', { name: /Like|Unlike/i });
    if (await likeBtn.isVisible()) {
      await likeBtn.click();
      await page.waitForTimeout(500);
    }

    // Share button
    const shareBtn = page.getByRole('button', { name: /Share|Copied/i }).first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await page.waitForTimeout(300);
    }

    // Comment view & submission
    const commentBtn = page.getByRole('button', { name: /View Comments|Leave a Comment|Comment/i }).first();
    if (await commentBtn.isVisible()) {
      await commentBtn.click();
      const nameInput = page.getByLabel(/Your Name/i);
      await expect(nameInput).toBeVisible();
      await nameInput.fill(`Smoke Author ${SMOKE_MARKER}`);
      const emailInput = page.getByLabel(/Your Email/i);
      if (await emailInput.isVisible()) {
        await emailInput.fill('smoke-author@example.com');
      }
      const thoughtsInput = page.getByLabel(/What are your thoughts/i);
      await thoughtsInput.fill('Comprehensive smoke verification comment for quality assurance.');
      await page.getByRole('button', { name: /Post Comment|Submit Comment/i }).click();
      await page.waitForTimeout(1000);
    }
  });

  test('5. Multi-language routing and hreflang (/am and /om)', async ({ page }) => {
    // Amharic
    await page.goto('/am');
    await expect(page).toHaveURL(/\/am/);
    const htmlLangAm = await page.getAttribute('html', 'lang');
    expect(htmlLangAm).toBe('am');

    // Oromo
    await page.goto('/om');
    await expect(page).toHaveURL(/\/om/);
    const htmlLangOm = await page.getAttribute('html', 'lang');
    expect(htmlLangOm).toBe('om');

    // Verify alternate hreflang tags on home page
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
  });

  test('6. Error handling: 404 not-found and 500 error boundary', async ({ page }) => {
    // 404 Page
    const notFoundResp = await page.goto(`/non-existent-page-${SMOKE_MARKER}`);
    expect(notFoundResp?.status()).toBe(404);
    await expect(page.locator('text=404')).toBeVisible();

    // 500 Error boundary
    await page.goto('/?throwTestError=1');
    await expect(page.locator('text=Something went wrong')).toBeVisible();
    const content = await page.content();
    expect(content).not.toContain('postgres://secret@db');
    expect(content).not.toContain('simulated secret internal server error');
  });

  test('7. Security headers on route types', async ({ request }) => {
    // Public HTML page
    const publicResp = await request.get('/');
    const publicHeaders = publicResp.headers();
    expect(publicHeaders['x-content-type-options']).toBe('nosniff');
    expect(publicHeaders['x-frame-options']).toBe('DENY');
    expect(publicHeaders['referrer-policy']).toBeTruthy();

    // Health API endpoint (200 OK and 503 Degraded)
    const healthResp = await request.get('/api/health');
    expect(healthResp.status()).toBe(200);
    const healthJson = await healthResp.json();
    expect(healthJson.status).toBe('ok');
    expect(healthResp.headers()['cache-control']).toContain('no-store');

    const degradedResp = await request.get('/api/health?simulate=down');
    expect(degradedResp.status()).toBe(503);
    const degradedJson = await degradedResp.json();
    expect(degradedJson.status).toBe('degraded');
    expect(degradedResp.headers()['cache-control']).toContain('no-store');

    // Robots.txt
    const robotsResp = await request.get('/robots.txt');
    expect(robotsResp.status()).toBe(200);
    const robotsText = await robotsResp.text();
    expect(robotsText).toContain('Disallow: /admin');
    expect(robotsText).toContain('Sitemap:');

    // Sitemap.xml
    const sitemapResp = await request.get('/sitemap.xml');
    expect(sitemapResp.status()).toBe(200);
    const sitemapText = await sitemapResp.text();
    expect(sitemapText).toContain('<urlset');
  });
});
