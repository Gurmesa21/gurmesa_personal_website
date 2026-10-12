import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partD', 'part2b', 'screenshots');

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

test.describe('Part 2B Screenshots', () => {
  test('Capture sub-pages', async ({ page }) => {
    fs.mkdirSync(outDir, { recursive: true });

    // 1. Service Detail
    await page.goto('/services');
    const serviceLink = await page.locator('a[href^="/services/"]').first().getAttribute('href');
    if (serviceLink) {
      await captureLightDark(page, serviceLink, 'service-detail');
    }

    // 2. Work Detail
    await page.goto('/work');
    const workLink = await page.locator('a[href^="/work/"]').first().getAttribute('href');
    if (workLink) {
      await captureLightDark(page, workLink, 'work-detail');
    }

    // 3. Blog Detail
    await page.goto('/blog');
    const blogLink = await page.locator('a[href^="/blog/"]').first().getAttribute('href');
    if (blogLink) {
      await captureLightDark(page, blogLink, 'blog-detail');
    }

    // 4. Privacy Policy
    await captureLightDark(page, '/privacy', 'privacy');

    // 5. Terms of Service
    await captureLightDark(page, '/terms', 'terms');

    // 6. 404 Not Found
    await captureLightDark(page, '/non-existent-page-12345', 'not-found');
  });
});
