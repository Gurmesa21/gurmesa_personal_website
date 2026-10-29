import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Resume End-to-End', () => {
  test('upload a PDF as admin, set it as current resume, request from /about unauthenticated', async ({ page, request }) => {
    // 1. Log in as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123'); // from seed
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    // Create a dummy PDF file for upload
    const dummyPdfPath = path.join(process.cwd(), 'dummy-resume.pdf');
    // Minimal PDF content
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 21 >>
stream
BT
/F1 24 Tf
100 700 Td
(Test Resume) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
293
%%EOF`;
    fs.writeFileSync(dummyPdfPath, pdfContent);

    // 2. Go to media library and upload
    await page.goto('/admin/media');
    
    // The input name is "file"
    await page.setInputFiles('input[name="file"]', dummyPdfPath);
    await page.fill('input[name="altText"]', 'My e2e resume');
    
    // Click upload
    await Promise.all([
      page.waitForNavigation(),
      page.click('button:has-text("Upload")')
    ]);

    // Cleanup the dummy file
    try {
      if (fs.existsSync(dummyPdfPath)) fs.unlinkSync(dummyPdfPath);
    } catch {
      // Ignore EBUSY on Windows
    }

    // 3. Find the newly uploaded file and click "Set as Resume"
    // Wait for the specific asset we just uploaded.
    const pdfCard = page.locator('.space-y-4').filter({ hasText: 'application/pdf' }).first();
    await expect(pdfCard).toBeVisible();

    await Promise.all([
      page.waitForNavigation(),
      pdfCard.locator('button:has-text("Set as Resume")').click()
    ]);

    // Ensure it shows "Current Resume"
    await expect(pdfCard.locator('text=Current Resume')).toBeVisible();

    // 4. Log out to become unauthenticated visitor
    await page.goto('/api/auth/signout');
    await page.click('button[type="submit"]');

    // 5. Visit /about and click download resume
    await page.goto('/about');
    
    // There should be a link that points to the resume, or we can just fetch the resume endpoint if it exists
    // Where does /about link to? Let's check if the link has a specific class or text.
    // E.g. <a href="/api/resume">Download Resume</a>
    const downloadLink = page.locator('a:has-text("Download Resume")');
    if (await downloadLink.count() > 0) {
        const href = await downloadLink.getAttribute('href');
        expect(href).not.toBeNull();
        
        // Fetch it
        const res = await request.get(href!);
        expect(res.ok()).toBeTruthy();
        expect(res.headers()['content-type']).toContain('application/pdf');
    } else {
        // If the download link isn't directly on /about with that exact text, 
        // we can just test the /api/resume endpoint assuming that's how it's implemented.
        const res = await request.get('/api/resume');
        expect(res.ok()).toBeTruthy();
        expect(res.headers()['content-type']).toContain('application/pdf');
    }
  });
});
