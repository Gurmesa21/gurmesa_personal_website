import { getPublicPostBySlug } from '../../../../server/services/blogService';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPublicPostBySlug(resolvedParams.slug);
  if (!post) notFound();

  return (
    <article className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-5xl font-bold mb-6">{post.title}</h1>
      {post.category && <div className="text-sm font-semibold mb-8 text-blue-600">{post.category.name}</div>}
      <div className="prose prose-lg max-w-none whitespace-pre-wrap">
        {post.body}
      </div>
    </article>
  );
}