import { test, expect } from '@playwright/test';

test.describe('Admin CRUD Edit and Persist', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/admin\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/admin$/, { timeout: 15000 });
  });

  test('Services: Edit and persist', async ({ page }) => {
    await page.goto('/admin/services');
    
    // 1. Note existing item's current field value
    const firstRow = page.getByTestId('admin-row').first();
    const originalTitle = await firstRow.locator('.text-xl').first().textContent();
    const editLink = firstRow.getByTestId('edit-link');
    const href = await editLink.getAttribute('href');
    if (!href) throw new Error('No edit link found');
    
    // 2. Click Edit
    await editLink.click();
    await expect(page).toHaveURL(href);
    
    // 3. Change that field
    const uniqueAppend = ` - ${Date.now()}`;
    const newTitle = `${originalTitle}${uniqueAppend}`;
    await page.fill('input[name="title"]', newTitle);
    
    // 4. Submit the form
    await page.click('button[type="submit"]');
    
    // 5. Assert success (should redirect back to /admin/services)
    await expect(page).toHaveURL('/admin/services');
    
    // 6. Assert new value is displayed
    const updatedRow = page.getByTestId('admin-row').first();
    const displayedTitle = await updatedRow.locator('.text-xl').first().textContent();
    expect(displayedTitle).toBe(newTitle);
    
    // 7. Revert to original
    await updatedRow.getByTestId('edit-link').click();
    await page.fill('input[name="title"]', originalTitle || '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/services');
  });

  test('Projects: Edit and persist', async ({ page }) => {
    await page.goto('/admin/projects');
    
    const firstRow = page.getByTestId('admin-row').first();
    const originalTitle = await firstRow.locator('.text-xl').first().textContent();
    const editLink = firstRow.getByTestId('edit-link');
    const href = await editLink.getAttribute('href');
    if (!href) throw new Error('No edit link found');
    
    await editLink.click();
    await expect(page).toHaveURL(href);
    
    const uniqueAppend = ` - ${Date.now()}`;
    const newTitle = `${originalTitle}${uniqueAppend}`;
    await page.fill('input[name="title"]', newTitle);
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/projects', { timeout: 15000 });
    
    const updatedRow = page.getByTestId('admin-row').first();
    const displayedTitle = await updatedRow.locator('.text-xl').first().textContent();
    expect(displayedTitle).toBe(newTitle);
    
    await updatedRow.getByTestId('edit-link').click();
    await page.fill('input[name="title"]', originalTitle || '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/projects', { timeout: 15000 });
  });

  test('Blog: Edit and persist', async ({ page }) => {
    await page.goto('/admin/blog');
    
    const firstRow = page.getByTestId('admin-row').first();
    const originalTitle = await firstRow.locator('td').first().textContent();
    const editLink = firstRow.getByTestId('edit-link');
    const href = await editLink.getAttribute('href');
    if (!href) throw new Error('No edit link found');
    
    await editLink.click();
    await expect(page).toHaveURL(href);
    
    const uniqueAppend = ` - ${Date.now()}`;
    const newTitle = `${originalTitle}${uniqueAppend}`;
    await page.fill('input[name="title"]', newTitle);
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/blog', { timeout: 15000 });
    
    const updatedRow = page.getByTestId('admin-row').first();
    const displayedTitle = await updatedRow.locator('td').first().textContent();
    expect(displayedTitle).toBe(newTitle);
    
    await updatedRow.getByTestId('edit-link').click();
    await page.fill('input[name="title"]', originalTitle || '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/blog', { timeout: 15000 });
  });
});
