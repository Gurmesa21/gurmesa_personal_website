/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/server/services/serviceService', () => ({
  getPublicServices: vi.fn(),
}));

vi.mock('@/server/services/projectService', () => ({
  getPublicProjects: vi.fn(),
}));

vi.mock('@/server/services/blogService', () => ({
  getPublicPosts: vi.fn(),
}));

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { getBaseUrl, buildAlternates, getVerificationMetadata } from '@/lib/seo';
import { getPublicServices } from '@/server/services/serviceService';
import { getPublicProjects } from '@/server/services/projectService';
import { getPublicPosts } from '@/server/services/blogService';

describe('lib/seo helpers', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('getBaseUrl resolves from NEXT_PUBLIC_SITE_URL or SITE_URL or fallback', () => {
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.RENDER_EXTERNAL_URL;

    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com/';
    expect(getBaseUrl()).toBe('https://custom-domain.com');

    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.SITE_URL = 'https://site-domain.com';
    expect(getBaseUrl()).toBe('https://site-domain.com');

    delete process.env.SITE_URL;
    process.env.APP_ENV = 'production';
    expect(getBaseUrl()).toBe('https://gurmesa.tech');

    process.env.APP_ENV = 'development';
    process.env.PORT = '3000';
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });

  it('buildAlternates builds canonical and 3-locale alternates with x-default', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://gurmesa.tech';

    // English (default / root)
    const enAlt = buildAlternates('/about', 'en');
    expect(enAlt.canonical).toBe('https://gurmesa.tech/about');
    expect(enAlt.languages).toEqual({
      en: 'https://gurmesa.tech/about',
      am: 'https://gurmesa.tech/am/about',
      om: 'https://gurmesa.tech/om/about',
      'x-default': 'https://gurmesa.tech/about',
    });

    // Amharic
    const amAlt = buildAlternates('/services', 'am');
    expect(amAlt.canonical).toBe('https://gurmesa.tech/am/services');
    expect(amAlt.languages?.['x-default']).toBe('https://gurmesa.tech/services');

    // Home root path
    const homeAlt = buildAlternates('', 'en');
    expect(homeAlt.canonical).toBe('https://gurmesa.tech');
    expect(homeAlt.languages).toEqual({
      en: 'https://gurmesa.tech',
      am: 'https://gurmesa.tech/am',
      om: 'https://gurmesa.tech/om',
      'x-default': 'https://gurmesa.tech',
    });
  });

  it('getVerificationMetadata returns google and bing tokens if present', () => {
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = 'google-123';
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION = 'bing-456';

    const verification = getVerificationMetadata();
    expect(verification?.verification?.google).toBe('google-123');
    expect(verification?.other?.['msvalidate.01']).toBe('bing-456');
  });
});

describe('app/robots.ts', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('returns production rules when APP_ENV=production', () => {
    process.env.APP_ENV = 'production';
    delete process.env.PLAYWRIGHT_TEST;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://gurmesa.tech';

    const rules = robots();
    const ruleObj = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;

    expect(ruleObj.allow).toBe('/');
    expect(ruleObj.disallow).toContain('/admin');
    expect(ruleObj.disallow).toContain('/api');
    expect(ruleObj.disallow).toContain('/api/');
    expect(ruleObj.disallow).toContain('/mock-storage/');
    expect(rules.sitemap).toBe('https://gurmesa.tech/sitemap.xml');
  });

  it('disallows all indexing when APP_ENV is not production', () => {
    process.env.APP_ENV = 'test';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

    const rules = robots();
    const ruleObj = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;

    expect(ruleObj.disallow).toContain('/');
    expect(ruleObj.disallow).toContain('/admin');
    expect(ruleObj.disallow).toContain('/api');
    expect(ruleObj.disallow).toContain('/api/');
    expect(rules.sitemap).toBe('http://localhost:3000/sitemap.xml');
  });
});

describe('app/sitemap.ts', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...origEnv };
    process.env.NEXT_PUBLIC_SITE_URL = 'https://gurmesa.tech';
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('generates 3 locales for static pages, filters confidential/draft projects, and handles hreflang alternates', async () => {
    (getPublicServices as any).mockResolvedValue([
      { slug: 'web-development', updatedAt: new Date('2026-01-01') },
    ]);

    (getPublicProjects as any).mockResolvedValue([
      {
        slug: 'public-project',
        confidentiality: 'PUBLIC',
        caseStudy: { status: 'PUBLISHED' },
        updatedAt: new Date('2026-01-01'),
      },
      {
        slug: 'anonymized-project',
        confidentiality: 'ANONYMIZED',
        caseStudy: { status: 'PUBLISHED' },
        updatedAt: new Date('2026-01-01'),
      },
      {
        slug: 'private-project',
        confidentiality: 'PRIVATE',
        caseStudy: { status: 'PUBLISHED' },
        updatedAt: new Date('2026-01-01'),
      },
    ]);

    (getPublicPosts as any).mockResolvedValue([
      { slug: 'test-article', status: 'PUBLISHED', updatedAt: new Date('2026-01-01') },
    ]);

    const items = await sitemap();

    // Verify static routes for all 3 locales
    const urls = items.map((i) => i.url);
    expect(urls).toContain('https://gurmesa.tech');
    expect(urls).toContain('https://gurmesa.tech/am');
    expect(urls).toContain('https://gurmesa.tech/om');
    expect(urls).toContain('https://gurmesa.tech/about');
    expect(urls).toContain('https://gurmesa.tech/am/about');
    expect(urls).toContain('https://gurmesa.tech/om/about');
    expect(urls).toContain('https://gurmesa.tech/privacy');
    expect(urls).toContain('https://gurmesa.tech/terms');

    // Verify dynamic routes
    expect(urls).toContain('https://gurmesa.tech/services/web-development');
    expect(urls).toContain('https://gurmesa.tech/am/services/web-development');
    expect(urls).toContain('https://gurmesa.tech/om/services/web-development');

    expect(urls).toContain('https://gurmesa.tech/work/public-project');
    expect(urls).toContain('https://gurmesa.tech/work/anonymized-project');
    expect(urls).not.toContain('https://gurmesa.tech/work/private-project');

    expect(urls).toContain('https://gurmesa.tech/blog/test-article');
    expect(urls).toContain('https://gurmesa.tech/am/blog/test-article');
    expect(urls).toContain('https://gurmesa.tech/om/blog/test-article');

    // Verify hreflang alternates structure
    const homeItem = items.find((i) => i.url === 'https://gurmesa.tech');
    expect(homeItem?.alternates?.languages).toEqual({
      en: 'https://gurmesa.tech',
      am: 'https://gurmesa.tech/am',
      om: 'https://gurmesa.tech/om',
      'x-default': 'https://gurmesa.tech',
    });
  });

  it('recovers gracefully with static routes when database services throw an error', async () => {
    (getPublicServices as any).mockRejectedValue(new Error('DB error'));
    (getPublicProjects as any).mockRejectedValue(new Error('DB error'));
    (getPublicPosts as any).mockRejectedValue(new Error('DB error'));

    const items = await sitemap();
    expect(items.length).toBeGreaterThan(0);
    const urls = items.map((i) => i.url);
    expect(urls).toContain('https://gurmesa.tech');
    expect(urls).toContain('https://gurmesa.tech/about');
  });
});
