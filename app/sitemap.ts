import { MetadataRoute } from 'next';
import { getPublicServices } from '@/server/services/serviceService';
import { getPublicProjects } from '@/server/services/projectService';
import { getPublicPosts } from '@/server/services/blogService';
import { getBaseUrl } from '@/lib/seo';

export const revalidate = 3600;

// Stable timestamp for static deployment release
const STATIC_LAST_MODIFIED = new Date('2026-11-04T00:00:00.000Z');

interface RouteConfig {
  path: string;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

const STATIC_ROUTES: RouteConfig[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 }, // home
  { path: '/services', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/work', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/testimonials', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const entriesMap = new Map<string, MetadataRoute.Sitemap[number]>();

  const createLocalizedEntries = (
    path: string,
    lastModified: Date,
    changeFrequency: 'weekly' | 'monthly' | 'yearly',
    priority: number
  ) => {
    const cleanPath = path === '' || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

    const enUrl = `${baseUrl}${cleanPath}`;
    const amUrl = `${baseUrl}/am${cleanPath}`;
    const omUrl = `${baseUrl}/om${cleanPath}`;

    const languages = {
      en: enUrl,
      am: amUrl,
      om: omUrl,
      'x-default': enUrl,
    };

    // English (unprefixed)
    entriesMap.set(enUrl, {
      url: enUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    });

    // Amharic (/am)
    entriesMap.set(amUrl, {
      url: amUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    });

    // Afaan Oromo (/om)
    entriesMap.set(omUrl, {
      url: omUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    });
  };

  // 1. Add static public routes
  for (const route of STATIC_ROUTES) {
    createLocalizedEntries(
      route.path,
      STATIC_LAST_MODIFIED,
      route.changeFrequency,
      route.priority
    );
  }

  // 2. Fetch and add dynamic routes via service layer
  try {
    const results = await Promise.allSettled([
      getPublicServices(),
      getPublicProjects(),
      getPublicPosts(),
    ]);

    // Published Services
    if (results[0].status === 'fulfilled') {
      const services = results[0].value || [];
      for (const service of services) {
        if (service?.slug) {
          const s = service as unknown as { slug: string; updatedAt?: Date | string };
          const lastModified = s.updatedAt ? new Date(s.updatedAt) : STATIC_LAST_MODIFIED;
          createLocalizedEntries(
            `/services/${encodeURIComponent(service.slug)}`,
            lastModified,
            'monthly',
            0.6
          );
        }
      }
    } else {
      console.warn('[sitemap] Failed to fetch services for sitemap:', results[0].reason?.message || 'Unknown error');
    }

    // Published Projects (PUBLIC or ANONYMIZED only, never PRIVATE)
    if (results[1].status === 'fulfilled') {
      const projects = results[1].value || [];
      for (const project of projects) {
        const p = project as unknown as { slug: string; updatedAt?: Date | string; confidentiality?: string };
        if (p?.slug && p.confidentiality !== 'PRIVATE') {
          const lastModified = p.updatedAt ? new Date(p.updatedAt) : STATIC_LAST_MODIFIED;
          createLocalizedEntries(
            `/work/${encodeURIComponent(p.slug)}`,
            lastModified,
            'monthly',
            0.6
          );
        }
      }
    } else {
      console.warn('[sitemap] Failed to fetch projects for sitemap:', results[1].reason?.message || 'Unknown error');
    }

    // Published Blog Posts
    if (results[2].status === 'fulfilled') {
      const posts = results[2].value || [];
      for (const post of posts) {
        if (post?.slug && (post.status === 'PUBLISHED' || !post.status)) {
          const lastModified = post.updatedAt ? new Date(post.updatedAt) : STATIC_LAST_MODIFIED;
          createLocalizedEntries(
            `/blog/${encodeURIComponent(post.slug)}`,
            lastModified,
            'monthly',
            0.6
          );
        }
      }
    } else {
      console.warn('[sitemap] Failed to fetch blog posts for sitemap:', results[2].reason?.message || 'Unknown error');
    }
  } catch (err: any) {
    console.warn('[sitemap] Error querying dynamic content for sitemap:', err?.message || 'Unknown error');
  }

  // Deterministic alphabetical sort by URL
  return Array.from(entriesMap.values()).sort((a, b) => a.url.localeCompare(b.url));
}
