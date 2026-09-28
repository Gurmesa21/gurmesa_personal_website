import { getPreviewPostBySlug } from '../../../server/services/blogService';
import { notFound } from 'next/navigation';

export default async function PreviewPage({ searchParams }: { searchParams: { slug?: string } }) {
  if (!searchParams.slug) notFound();
  const post = await getPreviewPostBySlug(searchParams.slug);
  if (!post) notFound();

  return (
    <article className="container mx-auto px-4 py-16 max-w-3xl bg-yellow-50">
      <div className="mb-4 text-orange-600 font-bold">PREVIEW MODE</div>
      <h1 className="text-5xl font-bold mb-6">{post.title}</h1>
      <div className="prose prose-lg max-w-none whitespace-pre-wrap">
        {post.body}
      </div>
    </article>
  );
}