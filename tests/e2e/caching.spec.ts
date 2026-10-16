import { test, expect } from '@playwright/test';

test.describe('Caching and Revalidation (End-to-End)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page).toHaveURL(/.*\/admin$/);
  });

  test('i. Publish a testimonial -> appears on /', async ({ page }) => {
    await page.goto('/admin/testimonials');
    const authorName = 'Caching Testimonial';
    await page.locator(`[data-testid="admin-row"]:has-text("${authorName}")`).first().locator('a[data-testid="edit-link"]').click();
    
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.selectOption('select[name="permissionStatus"]', 'AUTHORIZED');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/testimonials$/, { timeout: 15000 });
    
    await page.goto('/');
    await expect(page.locator(`text=${authorName}`).first()).toBeVisible();

    await page.goto('/admin/testimonials');
    await page.locator(`[data-testid="admin-row"]:has-text("${authorName}")`).first().locator('a[data-testid="edit-link"]').click();
    await page.selectOption('select[name="permissionStatus"]', 'REVOKED');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/testimonials$/, { timeout: 15000 });

    await page.goto('/');
    await expect(page.locator(`text=${authorName}`).first()).not.toBeVisible();
  });

  test('ii. Mark a featured project DRAFT -> absent from / and /work', async ({ page }) => {
    await page.goto('/admin/projects');
    const projectTitle = "Caching Dashboard";
    await page.locator(`div[data-testid="admin-row"]:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[data-testid="edit-link"]').click();
    // Select the second select named 'status' which is the case study status
    await page.locator('select[name="status"]').nth(1).selectOption('DRAFT');
    await page.locator('text=Save Case Study').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/, { timeout: 15000 });

    await page.goto('/');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();
    await page.goto('/work');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();

    await page.goto('/admin/projects');
    await page.locator(`div[data-testid="admin-row"]:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[data-testid="edit-link"]').click();
    await page.locator('select[name="status"]').nth(1).selectOption('PUBLISHED');
    await page.locator('text=Save Case Study').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/, { timeout: 15000 });
  });

  test('iii. Unpublish a service -> absent from /services and /', async ({ page }) => {
    await page.goto('/admin/services');
    await page.locator('div[data-testid="admin-row"]:has(.text-xl:text-is("Caching Service"))').first().locator('a[data-testid="edit-link"]').click();
    await page.selectOption('select[name="status"]', 'DRAFT');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/services$/, { timeout: 15000 });

    await page.goto('/');
    await page.goto('/services');

    await page.goto('/admin/services');
    await page.locator('div[data-testid="admin-row"]:has(.text-xl:text-is("Caching Service"))').first().locator('a[data-testid="edit-link"]').click();
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/services$/, { timeout: 15000 });
  });

  test('iv. Unpublish a blog post -> absent from / and /blog', async ({ page }) => {
    await page.goto('/admin/blog');
    const postTitle = "Caching Post";
    await page.locator(`tr[data-testid="admin-row"]:has(td:text-is("${postTitle}"))`).first().locator('a[data-testid="edit-link"]').click();
    await page.selectOption('select[name="status"]', 'DRAFT');
    await page.locator('text=Save Post').click();
    await expect(page).toHaveURL(/.*\/admin\/blog$/, { timeout: 15000 });

    await page.goto('/');
    await expect(page.locator(`text=${postTitle}`).first()).not.toBeVisible();
    await page.goto('/blog');
    await expect(page.locator(`text=${postTitle}`).first()).not.toBeVisible();
    
    await page.goto('/sitemap.xml');
    await expect(page.locator('body')).not.toContainText('/blog/caching-post'); 

    await page.goto('/admin/blog');
    await page.locator(`tr[data-testid="admin-row"]:has(td:text-is("${postTitle}"))`).first().locator('a[data-testid="edit-link"]').click();
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.locator('text=Save Post').click();
    await expect(page).toHaveURL(/.*\/admin\/blog$/, { timeout: 15000 });
  });

  test('v. Change project to PRIVATE -> absent from /, /work, and sitemap.xml', async ({ page }) => {
    await page.goto('/admin/projects');
    const projectTitle = "Caching Fintech";
    await page.locator(`div[data-testid="admin-row"]:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[data-testid="edit-link"]').click();
    await page.selectOption('select[name="confidentiality"]', 'PRIVATE');
    await page.locator('text=Save Project').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/, { timeout: 15000 });

    await page.goto('/');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();
    await page.goto('/work');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();
    
    await page.goto('/sitemap.xml');
    await expect(page.locator('body')).not.toContainText(projectTitle.toLowerCase().replace(/\s+/g, '-'));

    // Restore
    await page.goto('/admin/projects');
    await page.locator(`div[data-testid="admin-row"]:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[data-testid="edit-link"]').click();
    await page.selectOption('select[name="confidentiality"]', 'ANONYMIZED'); // Seed uses ANONYMIZED for Fintech Platform
    await page.locator('text=Save Project').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/, { timeout: 15000 });
  });
});
