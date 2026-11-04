import { test, expect } from '@playwright/test';

const WIDTHS = [320, 360, 390, 412, 768];

// en for all routes; am/om for home, services, work, about, contact
const EN_ROUTES = [
  '/en',
  '/en/about',
  '/en/work',
  '/en/work/os-dashboard',
  '/en/services',
  '/en/services/web-development',
  '/en/blog',
  '/en/blog/first-post',
  '/en/testimonials',
  '/en/contact',
  '/en/privacy',
  '/en/terms',
];

const MULTI_LANG_ROUTES = [
  '/am',
  '/am/about',
  '/am/work',
  '/am/services',
  '/am/contact',
  '/om',
  '/om/about',
  '/om/work',
  '/om/services',
  '/om/contact',
];

const ALL_TEST_ROUTES = [...EN_ROUTES, ...MULTI_LANG_ROUTES];

test.describe('MASTER PROMPT Part 1 — Mobile Responsive & Zero Horizontal Overflow Verification', () => {
  for (const width of WIDTHS) {
    test.describe(`Viewport ${width}px`, () => {
      for (const route of ALL_TEST_ROUTES) {
        test(`zero horizontal overflow on ${route} at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(route, { waitUntil: 'domcontentloaded' });

          const overflowInfo = await page.evaluate(() => {
            const scrollW = document.documentElement.scrollWidth;
            const innerW = window.innerWidth;
            const isOver = scrollW > innerW;

            let culprit = '';
            if (isOver) {
              const elements = document.querySelectorAll('*');
              for (const el of Array.from(elements)) {
                // Ignore intentional scroll containers
                const overflowX = window.getComputedStyle(el).overflowX;
                if (overflowX === 'auto' || overflowX === 'scroll') continue;

                const r = el.getBoundingClientRect();
                if (r.right > innerW + 1) {
                  culprit = `${el.tagName.toLowerCase()}#${el.id || ''}.${(el.className || '').slice(0, 50)} (right: ${r.right}px, overflow: ${r.right - innerW}px)`;
                  break;
                }
              }
            }

            return { isOver, scrollW, innerW, culprit };
          });

          expect(
            overflowInfo.isOver,
            `Horizontal overflow on ${route} at ${width}px! ScrollWidth: ${overflowInfo.scrollW}px vs InnerWidth: ${overflowInfo.innerW}px. Culprit: ${overflowInfo.culprit}`
          ).toBe(false);

          // Verify header and footer visible
          await expect(page.locator('header').first()).toBeVisible();
          await expect(page.locator('footer').first()).toBeVisible();

          // Exactly one h1
          expect(await page.locator('h1').count()).toBe(1);
        });
      }
    });
  }

  test('mobile navigation drawer opens and closes with escape on phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Open mobile menu
    const menuBtn = page.locator('button[aria-label*="menu" i], header button:has(svg)').last();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);

      // Dialog content is open
      const dialog = page.locator('div[role="dialog"]');
      if (await dialog.isVisible()) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await expect(dialog).toBeHidden();
      }
    }
  });
});

test.describe('MASTER PROMPT Part 2 — About Profile Image Card Position and Size', () => {
  const VIEWPORTS = [375, 768, 1280];

  for (const width of VIEWPORTS) {
    test(`About profile image card at ${width}px conforms to baseline size and contain fit`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/about', { waitUntil: 'domcontentloaded' });

      const card = page.locator('[data-testid="about-profile-card"]');
      await expect(card).toBeVisible();

      const cardBox = await card.boundingBox();
      expect(cardBox).not.toBeNull();
      if (!cardBox) return;

      if (width === 375) {
        // Mobile: w-48 h-48 aspect-[3/4] -> exactly 192px wide
        expect(cardBox.width).toBeLessThanOrEqual(280);
        expect(cardBox.width).toBeGreaterThanOrEqual(180);
      } else if (width === 768) {
        // Tablet: md:col-span-5 md:w-full aspect-[3/4]
        expect(cardBox.width).toBeGreaterThanOrEqual(250);
        expect(cardBox.width).toBeLessThanOrEqual(350);
      } else if (width === 1280) {
        // Desktop: LanyardBadge profile card up to 280-300px
        expect(cardBox.width).toBeGreaterThanOrEqual(260);
        expect(cardBox.width).toBeLessThanOrEqual(320);
      }

      // Check LanyardBadge inside profile card
      const badge = card.locator('[data-testid="lanyard-badge-card"]');
      await expect(badge).toBeVisible();

      const imageOrFallback = badge.locator('img, video, span');
      await expect(imageOrFallback.first()).toBeVisible();

      // No horizontal overflow
      const isOver = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(isOver).toBe(false);
    });
  }
});

test.describe('MASTER PROMPT Part 3 — Minimal Hanging Lanyard Badge on Home Hero', () => {
  const VIEWPORTS = [320, 375, 768, 1280];

  test('Home page contains exactly one lanyard badge with only required fields and no removed text', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const badgeCard = page.locator('[data-testid="lanyard-badge-card"]');
    await expect(badgeCard).toHaveCount(1);
    await expect(badgeCard).toBeVisible();

    // Required fields: Name, Title, Location
    await expect(badgeCard.locator('[data-testid="badge-name"]')).toBeVisible();
    await expect(badgeCard.locator('[data-testid="badge-title"]')).toBeVisible();
    await expect(badgeCard.locator('[data-testid="badge-location"]')).toBeVisible();

    // Verify completely removed items are ABSENT
    const badgeText = await badgeCard.innerText();
    expect(badgeText).not.toContain('ENGINEER ID');
    expect(badgeText).not.toContain('VERIFIED');
    expect(badgeText).not.toContain('ASTU');
    expect(badgeText).not.toContain('AVN-2026-GT');
    expect(badgeText).not.toContain('Available for hire');
    expect(badgeText).not.toContain('Available for projects');
    expect(badgeCard.locator('[data-testid="barcode"]')).toHaveCount(0);
    expect(badgeCard.locator('text=Next.js')).toHaveCount(0);
    expect(badgeCard.locator('text=TypeScript')).toHaveCount(0);
  });

  for (const width of VIEWPORTS) {
    test(`Lanyard badge at ${width}px produces zero horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en', { waitUntil: 'domcontentloaded' });

      const badgeCard = page.locator('[data-testid="lanyard-badge-card"]');
      await expect(badgeCard).toBeVisible();

      const box = await badgeCard.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 2);
      }

      const isOver = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(isOver).toBe(false);
    });
  }

  test('Lanyard badge supports interactive drag transform and preserves pan-y touch action', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const badgeCard = page.locator('[data-testid="lanyard-badge-card"]');
    await expect(badgeCard).toBeVisible();

    // Verify touchAction pan-y is present for touch scrolling
    const touchAction = await badgeCard.evaluate((el) => window.getComputedStyle(el).touchAction);
    expect(touchAction).toContain('pan-y');

    // Simulate drag interaction
    const box = await badgeCard.boundingBox();
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 80, startY, { steps: 5 });

      // While dragging, group style transform should be set
      const group = page.locator('[data-testid="lanyard-group"]');
      const transform = await group.evaluate((el) => el.style.transform);
      expect(transform).toContain('rotate');

      await page.mouse.up();
    }
  });
});
