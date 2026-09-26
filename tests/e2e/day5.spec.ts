import { test, expect } from '@playwright/test';

test.describe('Day 5 - Public Pages and Navigation', () => {
  test('homepage renders hero, services preview, about snapshot with real seeded data', async ({ page }) => {
    await page.goto('/');
    
    // Check for Hero
    await expect(page.locator('h1')).not.toBeEmpty();
    await expect(page.getByText('Get in Touch')).toBeVisible();

    // Check for Services Preview (assuming seeded data has 'Services')
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
    await expect(page.getByText('View All Services')).toBeVisible();
    
    // Check for About Snapshot
    await expect(page.getByRole('heading', { name: 'About Me' })).toBeVisible();
    await expect(page.getByText('Read Full Bio')).toBeVisible();
  });

  test('services index -> click service -> detail page loads correctly', async ({ page }) => {
    await page.goto('/services');
    
    await expect(page.locator('h1')).toHaveText('Services');
    
    // Click the first service's 'View Details' link
    const firstServiceLink = page.getByText('View Details').first();
    await expect(firstServiceLink).toBeVisible();
    
    await firstServiceLink.click();
    
    // Detail page should load (Delivery Approach is unique to service detail)
    await expect(page.getByRole('heading', { name: 'Delivery Approach' })).toBeVisible();
  });
});
