import { test, expect } from '@playwright/test';

test.describe('SEO, Sitemap, and Search Indexing Verification', () => {
  test('robots.txt returns 200 plain text, references sitemap.xml, and does not redirect', async ({ request }) => {
    const res = await request.get('/robots.txt', { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'] || '';
    expect(contentType).toContain('text/plain');

    const body = await res.text();
    expect(body).toMatch(/user-agent:/i);
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /api/');
    expect(body).toMatch(/Sitemap:\s*https?:\/\/[^\s]+\/sitemap\.xml/);
  });

  test('sitemap.xml returns 200 XML, covers 3 locales, and excludes private/draft entities', async ({ request }) => {
    const res = await request.get('/sitemap.xml', { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'] || '';
    expect(contentType).toMatch(/(xml|text)/);

    const xml = await res.text();
    expect(xml).toContain('<urlset');
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');

    // Root and localized routes
    expect(xml).toContain('<loc>');
    expect(xml).toContain('/about</loc>');
    expect(xml).toContain('/am/about</loc>');
    expect(xml).toContain('/om/about</loc>');
    expect(xml).toContain('/services</loc>');
    expect(xml).toContain('/work</loc>');
    expect(xml).toContain('/blog</loc>');
    expect(xml).toContain('/contact</loc>');
    expect(xml).toContain('/privacy</loc>');
    expect(xml).toContain('/terms</loc>');

    // Check hreflang tags in sitemap
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('hreflang="am"');
    expect(xml).toContain('hreflang="om"');
    expect(xml).toContain('hreflang="x-default"');

    // Confidentiality checks: ensure private/draft entries are excluded
    expect(xml).not.toContain('private-project');
    expect(xml).not.toContain('draft-post');
  });

  const testPages = [
    { path: '/', expectedCanonicalSuffix: '' },
    { path: '/am', expectedCanonicalSuffix: '/am' },
    { path: '/om', expectedCanonicalSuffix: '/om' },
    { path: '/about', expectedCanonicalSuffix: '/about' },
    { path: '/services', expectedCanonicalSuffix: '/services' },
    { path: '/work', expectedCanonicalSuffix: '/work' },
    { path: '/blog', expectedCanonicalSuffix: '/blog' },
    { path: '/contact', expectedCanonicalSuffix: '/contact' },
    { path: '/privacy', expectedCanonicalSuffix: '/privacy' },
    { path: '/terms', expectedCanonicalSuffix: '/terms' },
  ];

  for (const { path, expectedCanonicalSuffix } of testPages) {
    test(`public page ${path} includes valid canonical, hreflang alternates, and no noindex`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Verify no X-Robots-Tag noindex header
      const headers = response?.headers() || {};
      const xRobots = headers['x-robots-tag'] || '';
      expect(xRobots).not.toContain('noindex');

      // Verify no <meta name="robots" content="noindex">
      const robotsMeta = page.locator('meta[name="robots"]');
      const robotsMetaCount = await robotsMeta.count();
      if (robotsMetaCount > 0) {
        const content = await robotsMeta.first().getAttribute('content');
        expect(content).not.toContain('noindex');
      }

      // Verify canonical
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const canonicalHref = await canonical.getAttribute('href');
      expect(canonicalHref).toBeTruthy();
      expect(canonicalHref).toMatch(/^https?:\/\//);
      if (expectedCanonicalSuffix === '') {
        expect(canonicalHref).toMatch(new RegExp(`^(https?:\\/\\/[^/]+)?/?$`));
      } else {
        expect(canonicalHref).toContain(expectedCanonicalSuffix);
      }

      // Verify alternates for hreflang
      const altEn = page.locator('link[rel="alternate"][hreflang="en"]');
      const altAm = page.locator('link[rel="alternate"][hreflang="am"]');
      const altOm = page.locator('link[rel="alternate"][hreflang="om"]');
      const altDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');

      await expect(altEn).toHaveCount(1);
      await expect(altAm).toHaveCount(1);
      await expect(altOm).toHaveCount(1);
      await expect(altDefault).toHaveCount(1);

      expect(await altEn.getAttribute('href')).toMatch(/^https?:\/\//);
      expect(await altAm.getAttribute('href')).toMatch(/^https?:\/\//);
      expect(await altOm.getAttribute('href')).toMatch(/^https?:\/\//);
      expect(await altDefault.getAttribute('href')).toMatch(/^https?:\/\//);
    });
  }

  test('admin pages include noindex in robots meta tag', async ({ page }) => {
    await page.goto('/admin/login');
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveCount(1);
    const content = await robotsMeta.getAttribute('content');
    expect(content).toContain('noindex');
  });
});
