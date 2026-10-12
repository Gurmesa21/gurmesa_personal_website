import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test('Capture Oromo Homepage', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/om');
  await page.waitForTimeout(5000);
  
  const outDir = path.join(process.cwd(), 'docs', 'evidence', 'day14-5', 'partD');
  fs.mkdirSync(outDir, { recursive: true });
  
  await page.screenshot({ path: path.join(outDir, 'part1-i18n.png') });
});
