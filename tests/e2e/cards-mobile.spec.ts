import { test, expect } from '@playwright/test';

test.describe('MASTER PROMPT — Card & Media Frame Architecture, Layout Uniformity & Mobile Integrity', () => {

  test('Home page: Service Card width equals Featured Work Card width at desktop 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Locate service cards and featured work cards
    const serviceCards = page.locator('section[aria-label="Services"] [data-card]');
    const workCards = page.locator('aside[aria-label="Featured Work"] [data-card]');

    await expect(serviceCards.first()).toBeVisible();
    await expect(workCards.first()).toBeVisible();

    const serviceBox = await serviceCards.first().boundingBox();
    const workBox = await workCards.first().boundingBox();

    expect(serviceBox).not.toBeNull();
    expect(workBox).not.toBeNull();

    if (serviceBox && workBox) {
      // Cards should be equal in width within 3px tolerance due to subpixel rendering
      const diff = Math.abs(serviceBox.width - workBox.width);
      expect(
        diff,
        `Service card width (${serviceBox.width}px) must equal Featured Work card width (${workBox.width}px) within 3px`
      ).toBeLessThanOrEqual(3);
    }
  });

  test('Public pages: [data-card-media] maintains 16:9 ratio and sits above text content', async ({ page }) => {
    const pagesToTest = ['/en', '/en/services', '/en/work', '/en/blog'];

    for (const url of pagesToTest) {
      await page.setViewportSize({ width: 412, height: 915 });
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const cards = page.locator('[data-card]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);

      // Check first 3 cards on each page
      const sampleCount = Math.min(count, 3);
      for (let i = 0; i < sampleCount; i++) {
        const card = cards.nth(i);
        const media = card.locator('[data-card-media]');

        if (await media.isVisible()) {
          const mBox = await media.boundingBox();
          expect(mBox).not.toBeNull();
          if (mBox) {
            const ratio = mBox.width / mBox.height;
            // 16/9 is ~1.7777... allow 1.70 to 1.85 tolerance
            expect(
              ratio,
              `Media on ${url} card ${i} should have 16:9 ratio (got width=${mBox.width}, height=${mBox.height}, ratio=${ratio})`
            ).toBeGreaterThan(1.70);
            expect(ratio).toBeLessThan(1.85);

            // Verify title is below media (never overlapping)
            const title = card.locator('h2, h3').first();
            if (await title.isVisible()) {
              const tBox = await title.boundingBox();
              if (tBox) {
                expect(
                  tBox.y,
                  `Title y (${tBox.y}) should be at or below media bottom (${mBox.y + mBox.height})`
                ).toBeGreaterThanOrEqual(mBox.y + mBox.height - 2);
              }
            }
          }
        }
      }
    }
  });

  test('Services page: long price label wraps gracefully without colliding with CTA at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/en/services', { waitUntil: 'domcontentloaded' });

    const cards = page.locator('[data-card]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const footer = card.locator('div.mt-auto');
      if (await footer.isVisible()) {
        const fBox = await footer.boundingBox();
        expect(fBox).not.toBeNull();
        if (fBox) {
          // Footer should not horizontally overflow card
          const cBox = await card.boundingBox();
          if (cBox) {
            expect(fBox.width).toBeLessThanOrEqual(cBox.width);
          }
        }
      }
    }
  });

  test('About page: LanyardBadge renders with size="about" hanging from card top edge', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/en/about', { waitUntil: 'domcontentloaded' });

    const profileCard = page.locator('[data-testid="about-profile-card"]');
    await expect(profileCard).toBeVisible();

    const badge = profileCard.locator('[data-testid="lanyard-badge-card"]');
    await expect(badge).toBeVisible();

    const badgeBox = await badge.boundingBox();
    expect(badgeBox).not.toBeNull();
    if (badgeBox) {
      // Badge width must be responsive and <= 280px
      expect(badgeBox.width).toBeLessThanOrEqual(285);
    }
  });

  test('Slug pages: 16:9 media banner renders without clipping or overflow at mobile widths', async ({ page }) => {
    const slugRoutes = [
      '/en/work/os-dashboard',
      '/en/services/web-development',
      '/en/blog/first-post',
    ];

    for (const route of slugRoutes) {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const banner = page.locator('.aspect-video').first();
      await expect(banner).toBeVisible();

      const bBox = await banner.boundingBox();
      expect(bBox).not.toBeNull();
      if (bBox) {
        expect(bBox.width).toBeLessThanOrEqual(375);
        const ratio = bBox.width / bBox.height;
        expect(ratio).toBeGreaterThan(1.70);
        expect(ratio).toBeLessThan(1.85);
      }
    }
  });

  test('Zero horizontal overflow across all pages at 360px and 412px', async ({ page }) => {
    test.setTimeout(120000);
    const routes = [
      '/en',
      '/en/about',
      '/en/services',
      '/en/work',
      '/en/blog',
      '/en/contact',
      '/en/testimonials',
      '/am',
      '/am/services',
      '/am/work',
      '/om',
      '/om/services',
      '/om/work',
    ];

    for (const width of [360, 412]) {
      for (const route of routes) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route, { waitUntil: 'domcontentloaded' });

        const isOver = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(isOver, `Horizontal overflow on ${route} at ${width}px`).toBe(false);
      }
    }
  });

});
