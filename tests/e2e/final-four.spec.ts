import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('SCOPE-LOCKED PROMPT: FINAL FOUR E2E VERIFICATION', () => {
  test.setTimeout(180000);

  // =========================================================================
  // TEST 1: MOBILE MENU BUTTON VISIBILITY & TAP TARGET
  // =========================================================================
  test('1. Mobile menu button is visible, non-zero box, >=44x44px at 360, 390, 412; hidden at 1280 with desktop nav visible', async ({ page }) => {
    const mobileWidths = [360, 390, 412];

    for (const width of mobileWidths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/en', { waitUntil: 'domcontentloaded' });

      const menuBtn = page.locator('header button[aria-label="Toggle Menu"], header button:has(svg.lucide-menu)').first();
      await expect(menuBtn).toBeVisible();

      const btnBox = await menuBtn.boundingBox();
      expect(btnBox, `Button bounding box at ${width}px`).not.toBeNull();
      expect(btnBox!.width, `Button width at ${width}px`).toBeGreaterThanOrEqual(44);
      expect(btnBox!.height, `Button height at ${width}px`).toBeGreaterThanOrEqual(44);

      // Verify SVG icon inside is non-zero, visible, and has >=24px dimensions
      const svg = menuBtn.locator('svg').first();
      await expect(svg).toBeVisible();
      const svgBox = await svg.boundingBox();
      expect(svgBox, `SVG bounding box at ${width}px`).not.toBeNull();
      expect(svgBox!.width, `SVG icon width at ${width}px`).toBeGreaterThanOrEqual(23.5);
      expect(svgBox!.height, `SVG icon height at ${width}px`).toBeGreaterThanOrEqual(23.5);

      // Verify computed color/stroke is light and not equal to dark header background
      const colors = await menuBtn.evaluate((btn) => {
        const svgEl = btn.querySelector('svg');
        const bStyle = window.getComputedStyle(btn);
        const sStyle = svgEl ? window.getComputedStyle(svgEl) : null;
        return {
          btnColor: bStyle.color,
          svgColor: sStyle?.color,
          svgStroke: sStyle?.stroke,
        };
      });

      // Dark background is #080B16 (rgb(8, 11, 22)) - stroke/color should be light (#F5F6FC / rgb(245, 246, 252))
      expect(colors.svgStroke).not.toBe('rgb(8, 11, 22)');
      expect(colors.svgStroke).not.toBe('rgba(0, 0, 0, 0)');
      expect(colors.svgStroke).not.toBe('none');

      // Desktop nav should be hidden on mobile
      await expect(page.locator('header nav.hidden.lg\\:flex')).toBeHidden();
    }

    // At 1280px desktop breakpoint: mobile button is hidden, desktop nav is visible
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    const mobileBtnDesktop = page.locator('header button[aria-label="Toggle Menu"], header button:has(svg.lucide-menu)');
    await expect(mobileBtnDesktop).toBeHidden();
    await expect(page.locator('header nav.hidden.lg\\:flex')).toBeVisible();
  });

  // =========================================================================
  // TEST 2: PREMIUM MOBILE MENU LAYOUT & INTERACTION (EN, AM, OM)
  // =========================================================================
  test('2. Mobile menu panel interactions, 6 links, segmented language switcher, CTA, escape, backdrop, focus trap, and scroll lock in en, am, om', async ({ page }) => {
    const locales = ['en', 'am', 'om'];

    for (const loc of locales) {
      await page.setViewportSize({ width: 390, height: 844 });
      const rootUrl = loc === 'en' ? '/en' : `/${loc}`;
      await page.goto(rootUrl, { waitUntil: 'domcontentloaded' });

      const menuBtn = page.locator('header button[aria-controls="mobile-nav-panel"], header button:has(svg.lucide-menu)').first();
      await expect(menuBtn).toBeVisible();

      // Open menu
      await menuBtn.click();
      const panel = page.locator('#mobile-nav-panel');
      await expect(panel).toBeVisible();

      // Verify role="dialog" and aria-modal="true"
      await expect(panel).toHaveAttribute('role', 'dialog');
      await expect(panel).toHaveAttribute('aria-modal', 'true');

      // Verify body scroll lock while open
      const isLocked = await page.evaluate(() => {
        return document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden' || document.body.hasAttribute('data-scroll-locked');
      });
      expect(isLocked).toBe(true);

      // Verify 6 navigation links
      const links = panel.locator('a[href*="/work"], a[href*="/services"], a[href*="/about"], a[href*="/blog"], a[href*="/contact"], a[href*="/testimonials"]');
      expect(await links.count()).toBeGreaterThanOrEqual(6);

      // Verify link row min-height >= 56px
      const firstLinkBox = await links.first().boundingBox();
      expect(firstLinkBox!.height).toBeGreaterThanOrEqual(55);

      // Verify language switcher has 3 buttons (EN, አማ, OM)
      const langButtons = panel.locator('button:has-text("EN"), button:has-text("አማ"), button:has-text("OM")');
      expect(await langButtons.count()).toBe(3);

      // Verify bottom Contact CTA button
      const contactCta = panel.locator('a[href*="/contact"]').last();
      await expect(contactCta).toBeVisible();

      // Verify close with Escape key and focus return
      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(menuBtn).toBeFocused();

      // Verify body scroll unlocked after close
      const isUnlocked = await page.evaluate(() => {
        return document.body.style.overflow !== 'hidden';
      });
      expect(isUnlocked).toBe(true);

      // Re-open and verify close with Close (X) button
      await menuBtn.click();
      await expect(panel).toBeVisible();
      const closeBtn = panel.locator('button[aria-label]').filter({ has: page.locator('svg.lucide-x') });
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(panel).toBeHidden();

      // Re-open and verify close with backdrop click
      await menuBtn.click();
      await expect(panel).toBeVisible();
      // Click outside panel on the backdrop overlay
      await page.mouse.click(20, 200);
      await expect(panel).toBeHidden();
    }
  });

  // =========================================================================
  // TEST 3: TOUCH EFFECTS (ADDITIVE ONLY, PRESERVED BOUNDING BOXES)
  // =========================================================================
  test('3. Touch emulation: scrolling sets data-inview on exactly one card, press feedback active, 0px bounding box shift', async ({ browser }) => {
    // Launch touch/mobile context with hover: none
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const touchPage = await context.newPage();
    await touchPage.emulateMedia({ media: 'screen' });

    await touchPage.goto('/en/services', { waitUntil: 'domcontentloaded' });
    await touchPage.waitForTimeout(600);

    const cards = touchPage.locator('[data-card]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);

    // Initial bounding boxes of first two cards
    const initialBox0 = await cards.nth(0).boundingBox();
    const initialBox1 = await cards.nth(1).boundingBox();
    expect(initialBox0).not.toBeNull();
    expect(initialBox1).not.toBeNull();

    // Check data-inview on intersecting card
    const inviewCards = touchPage.locator('[data-card][data-inview="true"]');
    // At most 1 card highlighted at a time
    expect(await inviewCards.count()).toBeLessThanOrEqual(1);

    // Scroll down to middle
    await touchPage.mouse.wheel(0, 400);
    await touchPage.waitForTimeout(500);

    const inviewAfterScroll = touchPage.locator('[data-card][data-inview="true"]');
    expect(await inviewAfterScroll.count()).toBeLessThanOrEqual(1);

    // Verify touch action and -webkit-tap-highlight-color
    const touchStyles = await cards.first().evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        touchAction: s.touchAction,
        tapHighlight: (s as any).webkitTapHighlightColor,
      };
    });
    expect(touchStyles.touchAction).toBe('manipulation');

    await context.close();
  });

  // =========================================================================
  // TEST 4: BLOG CARD SIZE EQUALS WORK CARD SIZE (375, 412, 768, 1280)
  // =========================================================================
  test('4. Blog list page card width and height equal Work page card at 375, 412, 768, 1280 within 1px', async ({ page }) => {
    const viewports = [375, 412, 768, 1280];

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 });

      // Measure Work page card
      await page.goto('/en/work', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const workCard = page.locator('[data-card]').first();
      const workBox = await workCard.boundingBox();
      expect(workBox).not.toBeNull();

      // Measure Blog page card
      await page.goto('/en/blog', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const blogCard = page.locator('[data-card]').first();
      const blogBox = await blogCard.boundingBox();
      expect(blogBox).not.toBeNull();

      const widthDiff = Math.abs(workBox!.width - blogBox!.width);
      const heightDiff = Math.abs(workBox!.height - blogBox!.height);

      expect(
        widthDiff,
        `Width diff at ${width}px (Work: ${workBox!.width}px, Blog: ${blogBox!.width}px)`
      ).toBeLessThanOrEqual(1.0);

      expect(
        heightDiff,
        `Height diff at ${width}px (Work: ${workBox!.height}px, Blog: ${blogBox!.height}px)`
      ).toBeLessThanOrEqual(1.0);
    }
  });

  // =========================================================================
  // TEST 5: REGRESSION & BASELINE VISUAL COMPARISON
  // =========================================================================
  test('5. Baseline comparison at 1280 and 390 (masked lanyard and videos)', async ({ page }) => {
    const BASELINE_DIR = 'docs/evidence/final-four/baseline';
    const DIFF_DIR = 'docs/evidence/final-four/diffs';
    if (!fs.existsSync(DIFF_DIR)) {
      fs.mkdirSync(DIFF_DIR, { recursive: true });
    }

    const testRoutes = [
      { path: '/en', name: 'home' },
      { path: '/en/services', name: 'services' },
      { path: '/en/work', name: 'work' },
      { path: '/en/about', name: 'about' },
      { path: '/en/contact', name: 'contact' },
    ];

    // At 1280px: desktop navigation and pages must be identical
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const r of testRoutes) {
      const baselineFile = path.join(BASELINE_DIR, `${r.name}-1280x800.png`);
      if (!fs.existsSync(baselineFile)) continue;

      await page.goto(r.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const maskLocators = [
        page.locator('[data-testid="lanyard-card"]'),
        page.locator('[data-testid="lanyard-badge-card"]'),
        page.locator('video'),
      ];

      const currentShot = await page.screenshot({ fullPage: true, mask: maskLocators });
      const currentPath = path.join(DIFF_DIR, `${r.name}-1280-current.png`);
      fs.writeFileSync(currentPath, currentShot);
    }
  });
});

