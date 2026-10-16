import { test } from '@playwright/test';

test('test language switcher', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  // click language switcher button
  await page.click('button[aria-label="Select Language"]');
  
  // click Amharic
  await page.click('button:has-text("አማርኛ")');
  
  await page.waitForLoadState('networkidle');
  console.log("Current URL:", page.url());
  
  // check if 404
  const bodyText = await page.innerText('body');
  console.log("Body preview:", bodyText.substring(0, 200));
});
