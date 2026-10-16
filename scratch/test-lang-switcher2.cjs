const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/');
  
  await page.click('button[aria-label="Select Language"]');
  await page.click('button:has-text("አማርኛ")');
  await page.waitForTimeout(2000); // wait explicitly
  
  console.log("URL after switch:", page.url());
  const bodyText = await page.innerText('body');
  console.log("Body text preview:");
  console.log(bodyText.substring(0, 500));
  
  await page.screenshot({ path: 'scratch/am-home.png' });
  await browser.close();
})();
