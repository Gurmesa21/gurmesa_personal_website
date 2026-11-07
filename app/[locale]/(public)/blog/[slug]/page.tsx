import { getPublicPostBySlug } from '@/server/services/blogService';
import { notFound } from 'next/navigation';
import { serializeJsonLd } from '@/lib/jsonLd';
import { getSeoOverride } from '@/server/services/seoService';
import { getBaseUrl, buildAlternates } from '@/lib/seo';
import { Metadata } from 'next';
import { getStorageAdapter } from '@/lib/storage';
import { BlogPostClientView } from '@/components/blog/BlogPostClientView';
import { getPublicProfile, getPublicSocialLinks } from '@/server/services/profileService';
import { getResumeUrl } from '@/server/services/mediaService';
import { formatReadingTime } from '@/lib/reading-time';
import { isTestMode } from '@/lib/test-mode';
import { unstable_noStore as noStore } from 'next/cache';

export const revalidate = 3600;
export const dynamic = 'auto';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || 'en';
  const rawSlug = resolvedParams.slug;
  const override = await getSeoOverride(`/blog/${rawSlug}`);
  const post = await getPublicPostBySlug(rawSlug);
  const siteUrl = getBaseUrl();
  const title = override?.title || post?.title || 'Post';
  const description = override?.description || post?.excerpt || 'Post details.';
  const pagePath = `/blog/${encodeURIComponent(rawSlug)}`;
  const pageUrl = locale === 'en' ? `${siteUrl}${pagePath}` : `${siteUrl}/${locale}${pagePath}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: buildAlternates(pagePath, locale, override?.canonical),
    openGraph: {
      title,
      description: description || undefined,
      url: pageUrl,
      siteName: 'AVENOR',
      locale: locale === 'am' ? 'am_ET' : (locale === 'om' ? 'om_ET' : 'en_US'),
      type: 'article',
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  if (isTestMode()) {
    noStore();
  }
  const resolvedParams = await params;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const post = await getPublicPostBySlug(resolvedParams.slug);

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "author": { "@type": "Person", "name": "Gurmesa" },
        "url": `${siteUrl}/blog/${resolvedParams.slug}`
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${siteUrl}/blog` },
          { "@type": "ListItem", "position": 3, "name": post.title, "item": `${siteUrl}/blog/${resolvedParams.slug}` }
        ]
      }
    ]
  };

  const readTime = formatReadingTime(post.body || '');

  let mediaObj = null;
  if (post.featuredImage?.storageKey) {
    const storage = getStorageAdapter();
    mediaObj = {
      url: await storage.getUrl(post.featuredImage.storageKey),
      mimeType: post.featuredImage.mimeType,
      altText: post.featuredImage.altText || post.title
    };
  }

  const serializedPost = {
    ...post,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    updatedAt: post.updatedAt ? post.updatedAt.toISOString() : new Date().toISOString(),
    comments: (post.comments || []).map(c => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt)
    }))
  };

  const [profile, socialLinks, resumeUrl] = await Promise.all([
    getPublicProfile(),
    getPublicSocialLinks(),
    getResumeUrl()
  ]);

  let avatarMedia = null;
  if (profile?.avatarUrl) {
    const isVideo = profile.avatarUrl.endsWith('.mp4') || profile.avatarUrl.endsWith('.webm');
    avatarMedia = {
      url: profile.avatarUrl,
      mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
      altText: profile?.name || 'Avatar'
    };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <BlogPostClientView
        post={serializedPost}
        mediaObj={mediaObj}
        readTime={readTime}
        authorName="Gurmesa"
        profile={profile}
        socialLinks={socialLinks}
        resumeUrl={resumeUrl}
        avatarMedia={avatarMedia}
      />
    </>
  );
}