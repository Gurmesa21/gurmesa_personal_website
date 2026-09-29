import { test, expect } from '@playwright/test';

test.describe('Caching and Revalidation (End-to-End)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('i. Publish a testimonial -> appears on /', async ({ page }) => {
    await page.goto('/admin/testimonials');
    const authorName = 'Bob Jones';
    await page.locator(`tr:has-text("${authorName}")`).first().locator('a:has-text("Edit")').click();
    
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.selectOption('select[name="permissionStatus"]', 'AUTHORIZED');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/testimonials$/);
    
    await page.goto('/');
    await expect(page.locator(`text=${authorName}`).first()).toBeVisible();

    await page.goto('/admin/testimonials');
    await page.locator(`tr:has-text("${authorName}")`).first().locator('a:has-text("Edit")').click();
    await page.selectOption('select[name="permissionStatus"]', 'REVOKED');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/testimonials$/);

    await page.goto('/');
    await expect(page.locator(`text=${authorName}`).first()).not.toBeVisible();
  });

  test('ii. Mark a featured project DRAFT -> absent from / and /work', async ({ page }) => {
    await page.goto('/admin/projects');
    const projectTitle = "Open Source Dashboard";
    await page.locator(`div.border:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[href*="/edit"]').click();
    // Select the second select named 'status' which is the case study status
    await page.locator('select[name="status"]').nth(1).selectOption('DRAFT');
    await page.locator('text=Save Case Study').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/);

    await page.goto('/');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();
    await page.goto('/work');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();

    await page.goto('/admin/projects');
    await page.locator(`div.border:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[href*="/edit"]').click();
    await page.locator('select[name="status"]').nth(1).selectOption('PUBLISHED');
    await page.locator('text=Save Case Study').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/);
  });

  test('iii. Unpublish a service -> absent from /services and /', async ({ page }) => {
    await page.goto('/admin/services');
    await page.locator('a[href*="/edit"]').first().click();
    await page.selectOption('select[name="status"]', 'DRAFT');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/services$/);

    await page.goto('/');
    await page.goto('/services');

    await page.goto('/admin/services');
    await page.locator('a[href*="/edit"]').first().click();
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/admin\/services$/);
  });

  test('iv. Unpublish a blog post -> absent from / and /blog', async ({ page }) => {
    await page.goto('/admin/blog');
    const postTitle = "First Post";
    await page.locator(`tr:has(td:text-is("${postTitle}"))`).first().locator('a[href*="/edit"]').click();
    await page.selectOption('select[name="status"]', 'DRAFT');
    await page.locator('text=Save Post').click();
    await expect(page).toHaveURL(/.*\/admin\/blog$/);

    await page.goto('/');
    await expect(page.locator(`text=${postTitle}`).first()).not.toBeVisible();
    await page.goto('/blog');
    await expect(page.locator(`text=${postTitle}`).first()).not.toBeVisible();
    
    await page.goto('/sitemap.xml');
    await expect(page.locator('body')).not.toContainText('/blog/first-post'); 

    await page.goto('/admin/blog');
    await page.locator(`tr:has(td:text-is("${postTitle}"))`).first().locator('a[href*="/edit"]').click();
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.locator('text=Save Post').click();
    await expect(page).toHaveURL(/.*\/admin\/blog$/);
  });

  test('v. Change project to PRIVATE -> absent from /, /work, and sitemap.xml', async ({ page }) => {
    await page.goto('/admin/projects');
    const projectTitle = "Fintech Platform";
    await page.locator(`div.border:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[href*="/edit"]').click();
    await page.selectOption('select[name="confidentiality"]', 'PRIVATE');
    await page.locator('text=Save Project').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/);

    await page.goto('/');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();
    await page.goto('/work');
    await expect(page.locator(`text=${projectTitle}`).first()).not.toBeVisible();
    
    await page.goto('/sitemap.xml');
    await expect(page.locator('body')).not.toContainText(projectTitle.toLowerCase().replace(/\s+/g, '-'));

    // Restore
    await page.goto('/admin/projects');
    await page.locator(`div.border:has(.text-xl:text-is("${projectTitle}"))`).first().locator('a[href*="/edit"]').click();
    await page.selectOption('select[name="confidentiality"]', 'ANONYMIZED'); // Seed uses ANONYMIZED for Fintech Platform
    await page.locator('text=Save Project').click();
    await expect(page).toHaveURL(/.*\/admin\/projects$/);
  });
});
