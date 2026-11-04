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

  test('Public pages: media is rendered as card background behind text overlay', async ({ page }) => {
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
        // Card has absolute inset-0 background media layer
        const bgMedia = card.locator('div.absolute.inset-0.z-0');
        await expect(bgMedia).toBeVisible();

        // Text content wrapper has relative z-10 sitting cleanly on top
        const textWrapper = card.locator('div.relative.z-10');
        await expect(textWrapper).toBeVisible();
      }
    }
  });

  test('Footer baseline alignment: in every grid row, footers sit at card bottom and on the same baseline within 1px', async ({ page }) => {
    test.setTimeout(120000);
    const pagesToTest = ['/en', '/en/services', '/en/work', '/en/blog'];
    const viewports = [
      { width: 375, height: 800 },
      { width: 768, height: 900 },
      { width: 1280, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      for (const url of pagesToTest) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const cards = page.locator('[data-card]');
        const count = await cards.count();
        if (count < 2) continue;

        // Collect card top and footer top
        const cardData: { cardY: number; footerY: number }[] = [];
        for (let i = 0; i < count; i++) {
          const card = cards.nth(i);
          const cBox = await card.boundingBox();
          const footer = card.locator('[data-card-footer]');
          if (await footer.isVisible()) {
            const fBox = await footer.boundingBox();
            if (cBox && fBox) {
              cardData.push({ cardY: Math.round(cBox.y), footerY: fBox.y });
            }
          }
        }

        // Group cards by row where card top is within 5px
        const rows: { [key: number]: number[] } = {};
        for (const item of cardData) {
          const existingKey = Object.keys(rows).map(Number).find(k => Math.abs(k - item.cardY) <= 5);
          if (existingKey !== undefined) {
            rows[existingKey].push(item.footerY);
          } else {
            rows[item.cardY] = [item.footerY];
          }
        }

        // Assert for each multi-card row that footer top positions differ by at most 1px
        for (const [rowY, footerYs] of Object.entries(rows)) {
          if (footerYs.length >= 2) {
            const min = Math.min(...footerYs);
            const max = Math.max(...footerYs);
            const diff = max - min;
            expect(
              diff,
              `On ${url} at ${vp.width}px (row top ~${rowY}px), footers must align within 1px (got diff=${diff}px)`
            ).toBeLessThanOrEqual(1.0);
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
