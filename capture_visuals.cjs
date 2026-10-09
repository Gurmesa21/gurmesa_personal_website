const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000'; // Make sure app is running on 3000 or 3007

  // Ensure output dir exists
  const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partD', 'part2-visuals', 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Capturing Home Visual...');
  await page.goto(`${baseUrl}/en`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '1-home-visual.png'), fullPage: true });

  console.log('Capturing Case Study Visual...');
  await page.goto(`${baseUrl}/en/work/ecommerce-platform`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '2-case-study-visual.png'), fullPage: true });

  console.log('Capturing Admin Inquiries Visual...');
  // First login
  await page.goto(`${baseUrl}/admin/login`);
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/admin');
  
  // Go to inquiries
  await page.goto(`${baseUrl}/admin/inquiries`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '3-admin-inquiries-visual.png'), fullPage: true });

  console.log('Screenshots captured successfully.');
  await browser.close();
})();
