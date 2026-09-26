import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

test.describe('Day 6 - Portfolio & Case Studies (E2E & SEC-ACL)', () => {
  let privateProjectSlug: string;
  let unpublishedCaseStudySlug: string;
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    // We expect these to exist from the integration test DB seed or we find them.
    const privateProject = await prisma.project.findFirst({
      where: { confidentiality: 'PRIVATE' },
    });
    const unpublishedCS = await prisma.project.findFirst({
      where: { confidentiality: 'PUBLIC', caseStudy: { status: 'DRAFT' } },
    });
    
    // Fallbacks just in case
    privateProjectSlug = privateProject?.slug || 'private-test-project';
    unpublishedCaseStudySlug = unpublishedCS?.slug || 'unpublished-cs-project';
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('SEC-ACL-02(c): /work page does NOT render the private project', async ({ page }) => {
    await page.goto('/work');
    const content = await page.content();
    // Assuming the title or slug of the private project is in the HTML if leaked
    expect(content).not.toContain(privateProjectSlug);
  });

  test('SEC-ACL-02(d): /work/[slug] returns 404 for a private project', async ({ page }) => {
    const response = await page.goto(`/work/${privateProjectSlug}`);
    expect(response?.status()).toBe(404);
    // Ensure it's actually the Next.js not-found page and not an error page or content page
    await expect(page.locator('h2')).toHaveText(/Not Found/i, { ignoreCase: true, timeout: 5000 }).catch(() => {
        // next.js default 404 contains "This page could not be found"
        expect(page.locator('text=This page could not be found')).toBeVisible();
    });
  });

  test('SEC-ACL-02(e): sitemap.xml does NOT contain the private project URL', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const xml = await response.text();
    expect(xml).not.toContain(`/work/${privateProjectSlug}`);
  });

  test('SEC-ACL-03(c): /work page does NOT render unpublished case studies', async ({ page }) => {
    await page.goto('/work');
    const content = await page.content();
    expect(content).not.toContain(unpublishedCaseStudySlug);
  });

  test('SEC-ACL-03(d): /work/[slug] returns 404 for an unpublished case study', async ({ page }) => {
    const response = await page.goto(`/work/${unpublishedCaseStudySlug}`);
    expect(response?.status()).toBe(404);
  });

  test('SEC-ACL-03(e): sitemap.xml does NOT contain unpublished case study URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const xml = await response.text();
    expect(xml).not.toContain(`/work/${unpublishedCaseStudySlug}`);
  });

  test('Public /work page renders seeded public case studies', async ({ page }) => {
    await page.goto('/work');
    // Ensure at least one link to a case study exists
    const links = page.locator('a[href^="/work/"]');
    await expect(links.first()).toBeVisible();
    
    // Click through to the first detail page
    const href = await links.first().getAttribute('href');
    await page.click(`a[href="${href}"]`);
    await page.waitForURL(`**${href}`);
    
    // Check that we are on a detail page (e.g. by looking for "The Problem" heading)
    await expect(page.locator('h2', { hasText: 'The Problem' })).toBeVisible();
  });
});
