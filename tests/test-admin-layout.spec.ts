import { test } from '@playwright/test';

test('admin login has css', async ({ page }) => {
  await page.goto('http://localhost:3000/admin/login');
  await page.screenshot({ path: 'scratch/admin-login.png' });
  const html = await page.content();
  console.log(html.substring(0, 1000));
});
