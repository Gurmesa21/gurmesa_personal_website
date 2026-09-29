import BlogForm from '../../BlogForm';
import { getAdminPostById } from '../../../../../../server/services/blogService';
import { blogRepository } from '../../../../../../server/repositories/blogRepository';
import { notFound } from 'next/navigation';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getAdminPostById(resolvedParams.id);
  if (!post) notFound();
  const categories = await blogRepository.findManyCategories();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <BlogForm post={post} categories={categories} />
    </div>
  );
}