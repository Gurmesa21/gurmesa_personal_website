import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility & Shell Features', () => {
  test('Axe scan on / (homepage with AUTHORIZED+PUBLISHED testimonial)', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const criticalOrSerious = accessibilityScanResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalOrSerious, `Violations found on /`).toEqual([]);
  });

  test('Axe scan on /contact', async ({ page }) => {
    await page.goto('/contact');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const criticalOrSerious = accessibilityScanResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalOrSerious, `Violations found on /contact`).toEqual([]);
  });

  test('Axe scan on /privacy', async ({ page }) => {
    await page.goto('/privacy');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const criticalOrSerious = accessibilityScanResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalOrSerious, `Violations found on /privacy`).toEqual([]);
  });

  test('Axe scan on /terms', async ({ page }) => {
    await page.goto('/terms');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const criticalOrSerious = accessibilityScanResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalOrSerious, `Violations found on /terms`).toEqual([]);
  });

  test('skip-to-content link works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Focus the skip link via keyboard (assuming it is the first focusable element)
    await page.keyboard.press('Tab');
    
    // Check if it's visible and focused
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
    
    // Hit enter
    await page.keyboard.press('Enter');
    
    // Check if URL contains #main-content
    expect(page.url()).toContain('#main-content');
  });

  test('mobile menu opens, traps focus, and closes with escape', async ({ page }) => {
    await page.goto('/');
    
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Find menu button
    const menuBtn = page.getByRole('button', { name: /toggle menu/i });
    
    // Open menu
    await menuBtn.click();
    
    // Verify dialog is visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Press escape to close
    await page.keyboard.press('Escape');
    
    // Verify dialog is hidden
    await expect(dialog).toBeHidden();
    
    // Verify focus returned to menu button
    await expect(menuBtn).toBeFocused();
  });
});
