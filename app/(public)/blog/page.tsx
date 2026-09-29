import Link from 'next/link';
import { getPublicPosts } from '../../../server/services/blogService';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export async function generateMetadata(): Promise<Metadata> {
  const override = await getSeoOverride('/blog');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || 'Blog',
    description: override?.description || 'My articles.',
    alternates: { canonical: override?.canonical || `${siteUrl}/blog` },
    openGraph: {
      title: override?.title || 'Blog',
      url: `${siteUrl}/blog`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function BlogIndexPage({ searchParams }: { searchParams: { q?: string, category?: string, tag?: string } }) {
  const posts = await getPublicPosts({
    search: searchParams.q,
    category: searchParams.category,
    tag: searchParams.tag
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl font-bold mb-8">Blog</h1>
      
      <form className="mb-12 flex gap-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search posts..." className="border p-2 rounded w-full max-w-md" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Search</button>
      </form>

      <div className="space-y-12">
        {posts.map(post => (
          <article key={post.id} className="border-b pb-8">
            <h2 className="text-3xl font-bold mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
            </h2>
            {post.category && <div className="text-sm text-gray-600 mb-4">{post.category.name}</div>}
            <p className="text-lg text-gray-700">{post.excerpt}</p>
          </article>
        ))}
        {posts.length === 0 && <p>No posts found.</p>}
      </div>
    </div>
  );
}