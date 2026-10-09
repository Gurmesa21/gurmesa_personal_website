import { test, expect } from '@playwright/test';

test.describe('Admin CRUD Edit and Persist', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page).toHaveURL(/.*\/admin$/);
  });

  test('Services: Edit and persist', async ({ page }) => {
    await page.goto('/admin/services');
    
    // 1. Note existing item's current field value
    const firstRow = page.locator('.space-y-4 > div.card-base').first();
    const originalTitle = await firstRow.locator('.text-xl').first().textContent();
    const editLink = firstRow.locator('a:has-text("Edit")');
    const href = await editLink.getAttribute('href');
    if (!href) throw new Error('No edit link found');
    
    // 2. Click Edit
    await editLink.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\await expect(page).toHaveURL(href);')));
    
    // 3. Change that field
    const uniqueAppend = ` - ${Date.now()}`;
    const newTitle = `${originalTitle}${uniqueAppend}`;
    await page.fill('input[name="title"]', newTitle);
    
    // 4. Submit the form
    await page.click('button[type="submit"]');
    
    // 5. Assert success (should redirect back to /admin/services)
    await expect(page).toHaveURL('/admin/services');
    
    // 6. Assert new value is displayed
    const updatedRow = page.locator('.space-y-4 > div.card-base').first();
    const displayedTitle = await updatedRow.locator('.text-xl').first().textContent();
    expect(displayedTitle).toBe(newTitle);
    
    // 7. Revert to original
    await updatedRow.locator('a:has-text("Edit")').click();
    await page.fill('input[name="title"]', originalTitle || '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/services');
  });

  test('Projects: Edit and persist', async ({ page }) => {
    await page.goto('/admin/projects');
    
    const firstRow = page.locator('.space-y-4 > div.card-base').first();
    const originalTitle = await firstRow.locator('.text-xl').first().textContent();
    const editLink = firstRow.locator('a:has-text("Edit / Case Study")');
    const href = await editLink.getAttribute('href');
    if (!href) throw new Error('No edit link found');
    
    await editLink.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\await expect(page).toHaveURL(href);')));
    
    const uniqueAppend = ` - ${Date.now()}`;
    const newTitle = `${originalTitle}${uniqueAppend}`;
    await page.fill('input[name="title"]', newTitle);
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/projects');
    
    const updatedRow = page.locator('.space-y-4 > div.card-base').first();
    const displayedTitle = await updatedRow.locator('.text-xl').first().textContent();
    expect(displayedTitle).toBe(newTitle);
    
    await updatedRow.locator('a:has-text("Edit / Case Study")').click();
    await page.fill('input[name="title"]', originalTitle || '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/projects');
  });

  test('Blog: Edit and persist', async ({ page }) => {
    await page.goto('/admin/blog');
    
    const firstRow = page.locator('tbody tr').first();
    const originalTitle = await firstRow.locator('td').first().textContent();
    const editLink = firstRow.locator('a:has-text("Edit")');
    const href = await editLink.getAttribute('href');
    if (!href) throw new Error('No edit link found');
    
    await editLink.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\await expect(page).toHaveURL(href);')));
    
    const uniqueAppend = ` - ${Date.now()}`;
    const newTitle = `${originalTitle}${uniqueAppend}`;
    await page.fill('input[name="title"]', newTitle);
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/blog');
    
    const updatedRow = page.locator('tbody tr').first();
    const displayedTitle = await updatedRow.locator('td').first().textContent();
    expect(displayedTitle).toBe(newTitle);
    
    await updatedRow.locator('a:has-text("Edit")').click();
    await page.fill('input[name="title"]', originalTitle || '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/blog');
  });
});
