import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const pages = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'services', path: '/services' },
  { name: 'work', path: '/work' },
  { name: 'blog', path: '/blog' },
  { name: 'contact', path: '/contact' }
];

const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partD', 'part2a', 'screenshots');

test.describe('Part 2A Screenshots', () => {
  test('Capture light and dark mode screenshots', async ({ page }) => {
    fs.mkdirSync(outDir, { recursive: true });

    for (const p of pages) {
      // Light Mode
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(p.path);
      // Ensure page is fully loaded and any animations finished
      await page.waitForLoadState('networkidle');
      // For local testing, force theme to light if needed by setting localStorage
      await page.evaluate(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      });
      // Wait a moment for re-render
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${p.name}-light.png`), fullPage: true });

      // Dark Mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${p.name}-dark.png`), fullPage: true });
    }
  });
});
