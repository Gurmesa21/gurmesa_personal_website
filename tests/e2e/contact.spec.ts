import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const UNIQUE_MARKER = 'LEAK_TEST_MARKER_999@test.com';

test.describe('Inquiry & Testimonial E2E', () => {
  test.afterAll(async () => {
    await prisma.inquiry.deleteMany({ where: { email: UNIQUE_MARKER } });
  });

  test('contact form: happy path submits and shows confirmation, using keyboard only', async ({ page }) => {
    await page.goto('/contact');
    
    // Focus first element to start keyboard nav
    await page.focus('input[name="name"]');
    await page.keyboard.type('Keyboard User');
    await page.focus('input[name="email"]');
    await page.keyboard.type('keyboard@test.com');
    await page.focus('input[name="organization"]');
    await page.keyboard.type('Test Org');
    await page.selectOption('select[name="projectType"]', 'Business website');
    await page.focus('textarea[name="message"]');
    await page.keyboard.type('This is a test message that is long enough.');
    await page.focus('button[type="submit"]');
    await page.keyboard.press('Enter');

    // Wait for success message
    await expect(page.locator('text=Thank you!')).toBeVisible({ timeout: 10000 });
  });

  test('contact form: invalid submit focuses the error summary and associates errors with fields', async ({ page }) => {
    await page.goto('/contact');
    
    await page.click('button[type="submit"]');

    const errorSummary = page.locator('.bg-red-50');
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary).toBeFocused();

    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
  });

  test('inquiry-leak scan: assert the marker is absent from the HTML of public surfaces and sitemap', async ({ request }) => {
    // Seed the inquiry
    await prisma.inquiry.create({
      data: {
        name: 'Secret Guy',
        email: UNIQUE_MARKER,
        message: 'This should not leak',
        status: 'NEW'
      }
    });

    const urls = ['/', '/about', '/services', '/work', '/blog', '/contact', '/privacy', '/sitemap.xml'];
    for (const url of urls) {
      const response = await request.get(url);
      const html = await response.text();
      expect(html).not.toContain(UNIQUE_MARKER);
    }
  });

  test('unauthenticated visit to /admin/inquiries and /admin/testimonials redirects to login', async ({ page }) => {
    const urls = ['/admin/inquiries', '/admin/testimonials'];
    for (const url of urls) {
      await page.goto(url);
      await expect(page).toHaveURL(/.*\/admin\/login.*/);
    }
  });
});
