/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = 'docs/evidence/day14-5/partD1b/screenshots';

async function checkLocales() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const logs = [];
  page.on('console', msg => logs.push(`Console ${msg.type()}: ${msg.text()}`));
  
  const failedReqs = [];
  page.on('response', res => {
    if (res.status() >= 400 && res.url().includes('_next')) {
      failedReqs.push(`${res.status()} ${res.url()}`);
    }
  });

  // 1. Localized homepage (Amharic)
  console.log('Navigating to /am ...');
  const resAm = await page.goto(`${BASE_URL}/am`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'home-am.png'), fullPage: true });
  console.log('Amharic homepage status:', resAm.status());

  // 2. Localized homepage (Oromo)
  console.log('Navigating to /om ...');
  const resOm = await page.goto(`${BASE_URL}/om`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'home-om.png'), fullPage: true });
  console.log('Oromo homepage status:', resOm.status());

  // 3. /admin
  console.log('Navigating to /admin ...');
  const resAdmin = await page.goto(`${BASE_URL}/admin`);
  console.log('/admin final URL:', page.url(), 'status:', resAdmin.status());
  await page.screenshot({ path: path.join(OUT_DIR, 'admin-guard.png') });

  // 4. /am/admin
  console.log('Navigating to /am/admin ...');
  const resAmAdmin = await page.goto(`${BASE_URL}/am/admin`);
  console.log('/am/admin final URL:', page.url(), 'status:', resAmAdmin.status());
  await page.screenshot({ path: path.join(OUT_DIR, 'am-admin-guard.png') });

  // 5. /om/admin
  console.log('Navigating to /om/admin ...');
  const resOmAdmin = await page.goto(`${BASE_URL}/om/admin`);
  console.log('/om/admin final URL:', page.url(), 'status:', resOmAdmin.status());
  await page.screenshot({ path: path.join(OUT_DIR, 'om-admin-guard.png') });

  console.log('--- NEXT ERRORS ---');
  console.log(failedReqs);

  fs.writeFileSync(path.join(OUT_DIR, 'locale-results.txt'), JSON.stringify({ logs, failedReqs }, null, 2));

  await browser.close();
}

checkLocales().catch(console.error);
