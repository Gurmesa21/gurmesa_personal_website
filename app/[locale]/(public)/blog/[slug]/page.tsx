import { getPublicPostBySlug } from '@/server/services/blogService';
import { notFound } from 'next/navigation';
import { serializeJsonLd } from '@/lib/jsonLd';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';

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

import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { getStorageAdapter } from '@/lib/storage';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { ImageIcon } from 'lucide-react';
import { BlogComments } from '@/components/blog/BlogComments';
import { BlogInteractionButtons } from '@/components/blog/BlogInteractionButtons';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  
  const post = await getPublicPostBySlug((await params).slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": post?.title,
        "description": post?.excerpt,
        "author": { "@type": "Person", "name": "Author" },
        "url": `${siteUrl}/blog/${(await params).slug}`
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${siteUrl}/blog` },
          { "@type": "ListItem", "position": 3, "name": post?.title, "item": `${siteUrl}/blog/${(await params).slug}` }
        ]
      }
    ]
  };
  if (!post) notFound();

  let mediaObj = null;
  if (post.featuredImage?.storageKey) {
    const storage = getStorageAdapter();
    mediaObj = {
      url: await storage.getUrl(post.featuredImage.storageKey),
      mimeType: post.featuredImage.mimeType,
      altText: post.featuredImage.altText
    };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      
    <article className="container mx-auto px-4 py-16 max-w-3xl space-y-12">
      {/* Featured Image */}
      <div className="max-w-3xl mx-auto shadow-sm rounded-t-2xl overflow-hidden border border-b-0 border-slate-200 dark:border-slate-800">
        {mediaObj ? (
          <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
            <MediaRenderer url={mediaObj.url} mimeType={mediaObj.mimeType} altText={mediaObj.altText || post.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-primary/40" />
          </div>
        )}
      </div>

      <div className="mt-0 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-slate-50 tracking-tight font-heading">{post.title}</h1>
        {post.category && <div className="text-sm font-semibold mb-8 text-blue-600">{post.category.name}</div>}
        <MarkdownRenderer content={post.body} />
        
        {/* Post Interactions */}
        <div className="mt-12 py-6 border-t border-slate-200 dark:border-slate-800">
          <BlogInteractionButtons 
            postId={post.id} 
            postSlug={post.slug} 
            initialLikesCount={post.likesCount || 0}
            initialLikedByMe={post.likedByMe}
          />
        </div>

        {/* Comments Section */}
        <BlogComments 
          postId={post.id} 
          initialComments={(post.comments || []).map(c => ({
            ...c,
            createdAt: c.createdAt.toISOString()
          }))} 
        />
      </div>
    </article>
  </>
  );
}