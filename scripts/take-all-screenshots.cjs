/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = 'docs/evidence/day14-5/partC/screenshots';

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };

  ensureDir(path.join(OUT_DIR, 'admin'));
  ensureDir(path.join(OUT_DIR, 'locale'));
  ensureDir(path.join(OUT_DIR, 'light'));
  ensureDir(path.join(OUT_DIR, 'dark'));

  // Utility to take light/dark screenshots
  const snap = async (route, name) => {
    await page.goto(`${BASE_URL}${route}`);
    await page.waitForTimeout(1000);
    
    // Light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, `light/${name}.png`), fullPage: true });

    // Dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    // Also click theme toggle if available just in case emulateMedia isn't enough
    try {
       const hasToggle = await page.$('button:has(.lucide-moon), button:has(.lucide-sun)');
       if (hasToggle) {
         // evaluate to force dark class on html if needed
         await page.evaluate(() => document.documentElement.classList.add('dark'));
       }
    } catch(e) {}
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, `dark/${name}.png`), fullPage: true });
    
    // reset to light
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
  };

  console.log('Taking public pages...');
  await snap('/', 'home');
  await snap('/about', 'about');
  await snap('/services', 'services-index');
  await snap('/services/web-development', 'service-detail');
  await snap('/work', 'work-index');
  await snap('/work/os-dashboard', 'work-detail');
  await snap('/blog', 'blog-index');
  await snap('/blog/first-post', 'blog-detail');
  await snap('/contact', 'contact');

  console.log('Taking admin pages...');
  await snap('/admin/login', 'admin-login');
  
  // Login for admin
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[name="email"]', 'admin@gurmesa.com');
  await page.fill('input[name="password"]', 'gurmesa-secure-pass-2024');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
  await page.waitForTimeout(1000);

  // Admin screens
  await page.screenshot({ path: path.join(OUT_DIR, `admin/dashboard.png`), fullPage: true });
  
  await page.goto(`${BASE_URL}/admin/services`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, `admin/services.png`), fullPage: true });

  await page.goto(`${BASE_URL}/admin/projects`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, `admin/projects.png`), fullPage: true });

  await page.goto(`${BASE_URL}/admin/blog`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, `admin/blog.png`), fullPage: true });

  console.log('Taking locale pages...');
  await page.goto(`${BASE_URL}/`);
  await page.waitForTimeout(500);
  
  // Switch to Amharic
  await page.click('button[aria-label="Select Language"]');
  await page.waitForTimeout(200);
  await page.click('text=አማርኛ');
  await page.waitForURL('**/am');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, `locale/home-am.png`), fullPage: true });

  await page.goto(`${BASE_URL}/about`);
  await page.waitForTimeout(500);
  await page.click('button[aria-label="Select Language"]');
  await page.waitForTimeout(200);
  await page.click('text=Afaan Oromoo');
  await page.waitForURL('**/om/about');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, `locale/about-om.png`), fullPage: true });

  await browser.close();
  console.log('Done!');
}

takeScreenshots().catch(console.error);
