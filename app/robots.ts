import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const rawAppEnv = process.env.APP_ENV || '';
  const appEnv = rawAppEnv.replace(/^["']|["']$/g, '').trim();
  const rawPw = process.env.PLAYWRIGHT_TEST || '';
  const isPw = rawPw.replace(/^["']|["']$/g, '').trim() === '1';

  // Production guard: PLAYWRIGHT_TEST is forbidden in production
  if (appEnv === 'production' && isPw) {
    throw new Error('PLAYWRIGHT_TEST=1 is not allowed in production');
  }

  const isProduction = appEnv === 'production';
  const baseUrl = getBaseUrl();

  if (isProduction) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/api', '/mock-storage/'],
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  // Non-production (test, staging, preview, development):
  // Disallow all indexing while maintaining legacy test compatibility
  return {
    rules: {
      userAgent: '*',
      disallow: ['/', '/admin', '/api/', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
