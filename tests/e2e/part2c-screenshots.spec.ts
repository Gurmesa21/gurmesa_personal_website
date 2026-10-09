import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partD', 'part2c', 'screenshots');

async function captureLightDark(page: any, url: string, name: string) {
  // Light Mode
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, `${name}-light.png`), fullPage: true });

  // Dark Mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, `${name}-dark.png`), fullPage: true });
}

test.describe('Part 2C Screenshots', () => {
  test('Capture admin pages', async ({ page }) => {
    fs.mkdirSync(outDir, { recursive: true });

    // 0. Login
    await captureLightDark(page, '/admin/login', 'login');

    // Proceed to login
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // 1. Dashboard
    await captureLightDark(page, '/admin', 'dashboard');

    // 2. Projects Index
    await captureLightDark(page, '/admin/projects', 'projects-index');

    // 3. Blog Edit
    await page.goto('/admin/blog');
    const firstRow = page.locator('tbody tr').first();
    const editLink = firstRow.locator('a:has-text("Edit")');
    const href = await editLink.getAttribute('href');
    if (href) {
      await captureLightDark(page, href, 'blog-edit');
    }
  });
});
