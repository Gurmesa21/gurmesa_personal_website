import { test, expect } from '@playwright/test';

test.describe('Admin Comments Moderation Queue', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page).toHaveURL(/.*\/admin$/);
  });

  test('navigates to /admin/comments and verifies queue filters and UI', async ({ page }) => {
    // Navigate to comments queue
    await page.goto('/admin/comments');
    await expect(page).toHaveURL('/admin/comments');

    // Heading verification
    const heading = page.getByRole('heading', { name: /Comment Moderation/i });
    await expect(heading).toBeVisible();

    // Verify filter tabs exist
    await expect(page.getByRole('link', { name: /Pending Review/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Approved/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rejected/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /All Comments/i })).toBeVisible();

    // Switch between filter tabs
    await page.getByRole('link', { name: /All Comments/i }).click();
    await expect(page).toHaveURL(/.*status=ALL/);

    await page.getByRole('link', { name: /Pending Review/i }).click();
    await expect(page).toHaveURL(/.*status=PENDING/);
  });
});
