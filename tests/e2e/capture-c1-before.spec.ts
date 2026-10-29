import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'docs/evidence/phase3/screenshots-before');

const routes = [
  { name: 'about-en', path: '/en/about' },
  { name: 'services-en', path: '/en/services' },
  { name: 'services-slug-en', path: '/en/services/web-development' },
  { name: 'work-en', path: '/en/work' },
  { name: 'work-slug-en', path: '/en/work/fog' },
  { name: 'blog-en', path: '/en/blog' },
  { name: 'blog-slug-en', path: '/en/blog/second-post' },
  { name: 'contact-en', path: '/en/contact' },
  { name: 'testimonials-en', path: '/en/testimonials' },
  { name: 'privacy-en', path: '/en/privacy' },
  { name: 'terms-en', path: '/en/terms' },
  { name: '404-en', path: '/en/page-not-found-404' },
  { name: 'services-am', path: '/am/services' },
  { name: 'blog-am', path: '/am/blog' },
  { name: 'services-om', path: '/om/services' },
  { name: 'blog-om', path: '/om/blog' }
];

test.describe('C1 Before Screenshots', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  });

  for (const r of routes) {
    test(`capture before ${r.name}`, async ({ page }) => {
      // 1280px desktop
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(r.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${r.name}-1280.png`), fullPage: false });

      // 375px mobile
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(r.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `${r.name}-375.png`), fullPage: false });
    });
  }
});

