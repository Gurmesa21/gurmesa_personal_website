const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  
  // Desktop
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:3000/en/testimonials');
  await desktopPage.waitForTimeout(1000);
  
  const desktopFull = path.join(process.cwd(), 'scratch', 'testimonials-desktop-full.png');
  await desktopPage.screenshot({ path: desktopFull, fullPage: true });
  console.log('Saved to', desktopFull);

  const desktopView = path.join(process.cwd(), 'scratch', 'testimonials-desktop-view.png');
  await desktopPage.screenshot({ path: desktopView, fullPage: false });
  console.log('Saved to', desktopView);

  // Mobile
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:3000/en/testimonials');
  await mobilePage.waitForTimeout(1000);

  const mobileFull = path.join(process.cwd(), 'scratch', 'testimonials-mobile.png');
  await mobilePage.screenshot({ path: mobileFull, fullPage: true });
  console.log('Saved to', mobileFull);

  await browser.close();
})();
