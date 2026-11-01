import { test, expect } from '@playwright/test';
import { prisma } from '../../server/repositories/db';

test.describe('Phase C2: Speed + UI + Inquiry Feature Tests', () => {
  test('C2.a: Work page has no filter control and tech tags are clean badges', async ({ page }) => {
    await page.goto('/work');

    // 1. Verify absence of technology filter controls
    const filterNav = page.locator('nav[aria-label*="Filter"]');
    await expect(filterNav).toHaveCount(0);

    const filterSelect = page.locator('select[name="tech"]');
    await expect(filterSelect).toHaveCount(0);

    // 2. Verify tech tags on cards are spans, not links with ?tech=
    const techLinks = page.locator('a[href*="?tech="]');
    await expect(techLinks).toHaveCount(0);
  });

  test('C2.b: Inquiry list has exact 8 options in en, am, and om with empty placeholder', async ({ page }) => {
    const expectedValues = [
      '',
      'Landing page and website development',
      'Web application development',
      'Website and application management',
      'Maintenance and technical support',
      'Website and application modernization',
      'Hosting and server migration',
      'One-time feature updates and improvements',
      'Other / not sure yet',
    ];

    // English
    await page.goto('/contact');
    const selectEn = page.locator('select[name="projectType"]');
    await expect(selectEn).toBeVisible();
    const optionsEn = await selectEn.locator('option').all();
    expect(optionsEn.length).toBe(9); // 1 placeholder + 8 options
    for (let i = 0; i < optionsEn.length; i++) {
      const val = await optionsEn[i].getAttribute('value');
      expect(val).toBe(expectedValues[i]);
    }
    const placeholderTextEn = await optionsEn[0].textContent();
    expect(placeholderTextEn?.trim()).toBe('Select a service...');

    // Amharic
    await page.goto('/am/contact');
    const selectAm = page.locator('select[name="projectType"]');
    const optionsAm = await selectAm.locator('option').all();
    expect(optionsAm.length).toBe(9);
    for (let i = 0; i < optionsAm.length; i++) {
      const val = await optionsAm[i].getAttribute('value');
      expect(val).toBe(expectedValues[i]);
    }
    const placeholderTextAm = await optionsAm[0].textContent();
    expect(placeholderTextAm?.trim()).toBe('አገልግሎት ይምረጡ...');

    // Afaan Oromoo
    await page.goto('/om/contact');
    const selectOm = page.locator('select[name="projectType"]');
    const optionsOm = await selectOm.locator('option').all();
    expect(optionsOm.length).toBe(9);
    for (let i = 0; i < optionsOm.length; i++) {
      const val = await optionsOm[i].getAttribute('value');
      expect(val).toBe(expectedValues[i]);
    }
    const placeholderTextOm = await optionsOm[0].textContent();
    expect(placeholderTextOm?.trim()).toBe('Tajaajila filadhu...');
  });

  test('C2.c: Legacy inquiry values still display in admin', async ({ page }) => {
    // Seed a test inquiry with legacy value
    const legacyInquiry = await prisma.inquiry.create({
      data: {
        name: 'Legacy Client',
        email: 'legacy-client@example.com',
        organization: 'Legacy Corp',
        projectType: 'Legacy Custom Architecture',
        message: 'This inquiry was created under a legacy project type.',
        status: 'NEW',
      },
    });

    try {
      // Login to admin
      await page.goto('/admin/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 });

      // Navigate to legacy inquiry detail
      await page.goto(`/admin/inquiries/${legacyInquiry.id}`);
      await expect(page.locator('text=Legacy Custom Architecture')).toBeVisible();
    } finally {
      await prisma.inquiry.deleteMany({ where: { id: legacyInquiry.id } });
    }
  });

  test('C2.d: About page social links are vertically stacked and responsive at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about');

    const socialLinks = page.locator('a[aria-label="GitHub"], a[aria-label="LinkedIn"], a[aria-label="X (Twitter)"], a[aria-label="Email"], a[aria-label="Link"]');
    const count = await socialLinks.count();

    if (count >= 2) {
      let previousBox = await socialLinks.nth(0).boundingBox();
      for (let i = 1; i < count; i++) {
        const currentBox = await socialLinks.nth(i).boundingBox();
        if (previousBox && currentBox) {
          // Strictly increasing Y coordinate (vertically stacked)
          expect(currentBox.y).toBeGreaterThan(previousBox.y);
          // Roughly aligned X coordinate
          expect(Math.abs(currentBox.x - previousBox.x)).toBeLessThan(10);
        }
        previousBox = currentBox;
      }
    }

    // Verify no horizontal overflow at 375px
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('C2.e: Card media boxes maintain 16:9 aspect ratio', async ({ page }) => {
    // Check on /work
    await page.goto('/work');
    const workMediaBoxes = page.locator('.aspect-video');
    const workCount = await workMediaBoxes.count();
    if (workCount > 0) {
      const box = await workMediaBoxes.first().boundingBox();
      if (box) {
        const ratio = box.width / box.height;
        expect(ratio).toBeGreaterThan(1.7);
        expect(ratio).toBeLessThan(1.85);
      }
    }

    // Check on /services
    await page.goto('/services');
    const serviceMediaBoxes = page.locator('.aspect-video');
    const serviceCount = await serviceMediaBoxes.count();
    if (serviceCount > 0) {
      const box = await serviceMediaBoxes.first().boundingBox();
      if (box) {
        const ratio = box.width / box.height;
        expect(ratio).toBeGreaterThan(1.7);
        expect(ratio).toBeLessThan(1.85);
      }
    }
  });
});

