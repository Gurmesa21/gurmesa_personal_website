const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  // Login
  await page.goto('http://localhost:3000/admin/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  
  // Admin testimonials list
  await page.goto('http://localhost:3000/admin/testimonials');
  await page.waitForTimeout(1000);
  const listShot = path.join(process.cwd(), 'scratch', 'admin-testimonials-list.png');
  await page.screenshot({ path: listShot, fullPage: true });
  console.log('Saved list screenshot to', listShot);

  // Click edit on the first item
  const editLink = page.locator('a[data-testid="edit-link"]').first();
  if (await editLink.count() > 0) {
    await editLink.click();
    await page.waitForTimeout(1000);
    const editShot = path.join(process.cwd(), 'scratch', 'admin-testimonials-edit.png');
    await page.screenshot({ path: editShot, fullPage: true });
    console.log('Saved edit screenshot to', editShot);
  }

  await browser.close();
})();
