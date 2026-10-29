import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Content Security Policy - Media and Image External Origins', () => {
  test('Prove browser console has zero CSP violations for img and video from external origin', async ({ page }) => {
    const cspViolations: string[] = [];
    const allConsoleLogs: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      allConsoleLogs.push(`[${msg.type()}] ${text}`);
      if (
        text.toLowerCase().includes('violates the following content security policy directive') ||
        text.toLowerCase().includes('content security policy') ||
        text.toLowerCase().includes('csp')
      ) {
        cspViolations.push(text);
      }
    });

    // 1. Visit home page to load headers and document
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const cspHeader = response?.headers()['content-security-policy'] || '';
    expect(cspHeader).toContain("img-src");
    expect(cspHeader).toContain("media-src");

    // 2. Inject an <img> and a <video> pointing to external storage origin
    const externalStorageHost = 'https://br-raspy-math-b5fl7dc6.storage.c-7.us-east-2.aws.neon.tech';
    
    await page.evaluate((storageHost) => {
      // Create external image
      const img = document.createElement('img');
      img.id = 'test-external-csp-img';
      img.src = `${storageHost}/avenor-media/sample.png`;
      document.body.appendChild(img);

      // Create external video
      const vid = document.createElement('video');
      vid.id = 'test-external-csp-video';
      vid.src = `${storageHost}/avenor-media/sample.mp4`;
      document.body.appendChild(vid);
    }, externalStorageHost);

    // Give browser time to attempt loading and fire any potential CSP errors
    await page.waitForTimeout(2000);

    // 3. Save proof output to docs/evidence/b0/
    const outDir = path.join(process.cwd(), 'docs', 'evidence', 'b0');
    fs.mkdirSync(outDir, { recursive: true });
    
    const reportData = {
      timestamp: new Date().toISOString(),
      cspHeader,
      testedOrigins: {
        image: `${externalStorageHost}/avenor-media/sample.png`,
        video: `${externalStorageHost}/avenor-media/sample.mp4`,
      },
      cspViolationsCount: cspViolations.length,
      cspViolations,
      consoleLogsSample: allConsoleLogs.slice(-20),
    };

    fs.writeFileSync(
      path.join(outDir, '02-csp-console-proof.json'),
      JSON.stringify(reportData, null, 2),
      'utf8'
    );

    console.log('CSP Violations detected:', cspViolations.length);
    expect(cspViolations).toEqual([]);
  });
});
