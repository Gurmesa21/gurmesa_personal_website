import { test, expect } from '@playwright/test';

test.describe('Task 2 — Stability & Abnormal Re-render Prevention', () => {
  test('focus/blur and visibilitychange do NOT trigger unexpected RSC network re-fetches', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/en', { waitUntil: 'networkidle' });

    // Track any RSC network requests triggered while changing focus/visibility
    const rscRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('_rsc=') || url.includes('rsc=1')) {
        rscRequests.push(url);
      }
    });

    // 2. Simulate window blur & focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await page.waitForTimeout(300);

    // 3. Simulate visibilitychange (tab switch away and back)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(500);

    // 4. TabVisibilityRefresher was removed, so focus/visibilitychange must trigger 0 unexpected RSC requests
    expect(rscRequests.length).toBe(0);
  });

  test('comments input state is preserved across window blur and focus', async ({ page }) => {
    await page.goto('/en/blog/first-post', { waitUntil: 'networkidle' });

    // Open comments view or find comment form
    const commentBtn = page.locator('button[aria-label="View Comments"]');
    if (await commentBtn.count() > 0 && await commentBtn.first().isVisible()) {
      await commentBtn.first().click();
    }

    const nameInput = page.locator('input[placeholder*="Name" i], input[name="author"], input[id*="author"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Author Preserve');

      // Blur and re-focus window
      await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
        window.dispatchEvent(new Event('focus'));
      });
      await page.waitForTimeout(300);

      await expect(nameInput).toHaveValue('Test Author Preserve');
    }
  });

  test('public layout root does not include TabVisibilityRefresher', async ({ page }) => {
    await page.goto('/en');
    const refresher = page.locator('[data-testid="tab-visibility-refresher"]');
    await expect(refresher).toHaveCount(0);
  });
});

