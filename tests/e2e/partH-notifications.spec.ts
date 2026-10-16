import { test, expect } from '@playwright/test';

test.describe('Part H: Admin Notifications', () => {
  test('16. Unauthenticated access to the notifications list/API is rejected', async ({ page }) => {
    await page.goto('/admin/notifications');
    // It should redirect to login
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });

  test('17. Submit a real inquiry as visitor, log in as admin, confirm bell icon shows incremented count and new notification appears', async ({ page }) => {
    // 1. Log in as admin first to get the initial count
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin');
    
    // Parse the initial count from the bell icon, or assume it's X
    // The bell icon has a badge if count > 0
    let initialCount = 0;
    const badge = page.locator('a[href="/admin/notifications"] span.bg-red-600');
    if (await badge.count() > 0) {
      const text = await badge.innerText();
      initialCount = parseInt(text, 10) || 0;
    }

    // Log out (or just clear cookies)
    await page.context().clearCookies();

    // 2. Submit a real inquiry as a visitor
    await page.goto('/en/contact');
    
    const uniqueName = `NotifyTest-${Date.now()}`;
    await page.fill('input[name="name"]', uniqueName);
    await page.fill('input[name="email"]', 'notify@test.com');
    await page.fill('textarea[name="message"]', 'This is a test message to trigger a notification.');
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Thank you!')).toBeVisible({ timeout: 10000 });

    // 3. Log in as admin again
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');

    // 4. Confirm bell icon shows incremented unread count
    const newBadge = page.locator('a[href="/admin/notifications"] span.bg-red-600');
    await expect(newBadge).toBeVisible();
    const newText = await newBadge.innerText();
    const newCount = parseInt(newText, 10);
    expect(newCount).toBeGreaterThan(initialCount);

    // 5. Check if it appears in the list
    await page.click('a[href="/admin/notifications"]');
    await expect(page).toHaveURL(/.*\/admin\/notifications/);
    await expect(page.getByText(`New inquiry from ${uniqueName}`)).toBeVisible();
  });
});
