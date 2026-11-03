import { test, expect } from '@playwright/test';

const WIDTHS = [320, 360, 390, 412, 768];
const ROUTES = [
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

test.describe('Part A3 — Mobile Responsive & Zero Horizontal Overflow Verification', () => {
  for (const width of WIDTHS) {
    test.describe(`Viewport ${width}px`, () => {
      for (const route of ROUTES) {
        test(`zero horizontal overflow on ${route} at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(route, { waitUntil: 'load' });
          await page.waitForTimeout(300);

          const overflowInfo = await page.evaluate(() => {
            const scrollW = document.documentElement.scrollWidth;
            const innerW = window.innerWidth;
            const isOver = scrollW > innerW;

            let culprit = '';
            if (isOver) {
              const elements = document.querySelectorAll('*');
              for (const el of Array.from(elements)) {
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
        });
      }
    });
  }

  test('Hero Animated Engineer ID Badge renders cleanly and scales without overflowing on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/en');

    const badge = page.locator('[data-testid="engineer-badge"]');
    await expect(badge).toBeVisible();

    const box = await badge.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(320);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
    }

    // Verify badge contents
    await expect(badge.locator('text=ASTU')).toBeVisible();
    await expect(badge.locator('text=Next.js')).toBeVisible();
    await expect(badge.locator('text=AVN-')).toBeVisible();
  });

  test('About profile card maintains small dimensions with 9:16 inner frame', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/en/about');

    const card = page.locator('[data-testid="about-profile-card"]');
    await expect(card).toBeVisible();

    const frame = page.locator('[data-testid="profile-image-frame-9-16"]');
    await expect(frame).toBeVisible();

    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    if (cardBox) {
      // Outer card remains small (~192px), never expanding to 720x1280
      expect(cardBox.width).toBeLessThanOrEqual(250);
      expect(cardBox.height).toBeLessThanOrEqual(250);
    }
  });
});

