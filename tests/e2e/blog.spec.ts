import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

test.describe('Blog SEC-ACL E2E Tests', () => {
  let draftSlug = 'e2e-draft-post';
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    await prisma.blogPost.upsert({
      where: { slug: draftSlug },
      update: { status: 'DRAFT', title: 'Secret Draft' },
      create: {
        title: 'Secret Draft',
        slug: draftSlug,
        excerpt: 'e',
        body: 'b',
        status: 'DRAFT'
      }
    });
  });

  test.afterAll(async () => {
    await prisma.blogPost.deleteMany({ where: { slug: draftSlug } });
    await prisma.$disconnect();
  });

  test('Draft post is absent from public index HTML', async ({ page }) => {
    await page.goto('/blog');
    const content = await page.content();
    expect(content).not.toContain('Secret Draft');
  });

  test('Draft post returns 404 on direct lookup', async ({ page }) => {
    const res = await page.goto(`/blog/${draftSlug}`);
    expect(res?.status()).toBe(404);
  });

  test('Draft post is absent from sitemap', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const xml = await res.text();
    expect(xml).not.toContain(`/blog/${draftSlug}`);
  });
});
