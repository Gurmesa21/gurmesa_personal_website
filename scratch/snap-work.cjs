const { chromium } = require('playwright');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto('http://localhost:3000/work', { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: path.join(__dirname, 'work-page.png'), fullPage: true });
    await browser.close();
    console.log('SUCCESS');
  } catch (err) {
    console.error('ERROR:', err.message);
  }
})();
