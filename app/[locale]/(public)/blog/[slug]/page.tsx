import { getPublicPostBySlug } from '@/server/services/blogService';
import { notFound } from 'next/navigation';
import { serializeJsonLd } from '@/lib/jsonLd';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import { getStorageAdapter } from '@/lib/storage';
import { BlogPostClientView } from '@/components/blog/BlogPostClientView';
import { getPublicProfile, getPublicSocialLinks } from '@/server/services/profileService';
import { getResumeUrl } from '@/server/services/mediaService';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const override = await getSeoOverride(`/blog/${resolvedParams.slug}`);
  const post = await getPublicPostBySlug(resolvedParams.slug);
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || post?.title || 'Post',
    description: override?.description || post?.excerpt || 'Post details.',
    alternates: { canonical: override?.canonical || `${siteUrl}/blog/${resolvedParams.slug}` },
    openGraph: {
      title: override?.title || post?.title || 'Post',
      description: override?.description || post?.excerpt,
      url: `${siteUrl}/blog/${resolvedParams.slug}`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const words = (post.body || '').trim().split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

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

  const profile = await getPublicProfile();
  const socialLinks = await getPublicSocialLinks();
  const resumeUrl = await getResumeUrl();

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