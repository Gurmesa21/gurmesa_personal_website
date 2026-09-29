import { getPublicPostBySlug } from '../../../../server/services/blogService';
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      
    <article className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-5xl font-bold mb-6">{post.title}</h1>
      {post.category && <div className="text-sm font-semibold mb-8 text-blue-600">{post.category.name}</div>}
      <div className="prose prose-lg max-w-none whitespace-pre-wrap">
        {post.body}
      </div>
    </article>
  </>
  );
}