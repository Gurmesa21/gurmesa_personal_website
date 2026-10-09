import BlogForm from '../../BlogForm';
import { getAdminPostById } from '../../../../../../server/services/blogService';
import { blogRepository } from '../../../../../../server/repositories/blogRepository';
import { notFound } from 'next/navigation';
import AdminComments from '../../AdminComments';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getAdminPostById(resolvedParams.id);
  if (!post) notFound();
  const categories = await blogRepository.findManyCategories();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>
      <BlogForm post={post} categories={categories} />
      
      {/* Type assertion needed since getAdminPostById return type is inferred without comments initially, 
          but we just added it to the include statement */}
      <AdminComments comments={(post as any).comments || []} postId={post.id} />
    </div>
  );
}