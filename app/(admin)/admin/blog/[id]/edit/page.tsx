import BlogForm from '../../BlogForm';
import { getAdminPostById } from '../../../../../../server/services/blogService';
import { blogRepository } from '../../../../../../server/repositories/blogRepository';
import { notFound } from 'next/navigation';
import AdminComments from '../../AdminComments';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getAdminPostById(resolvedParams.id);
  if (!post) notFound();
  const categories = await blogRepository.findManyCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Edit Blog Post</h1>
          <p className="text-sm text-muted-foreground mt-1">Update article content, metadata, status, or featured media.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/blog">&larr; Back to Blog</Link>
        </Button>
      </div>

      <BlogForm post={post} categories={categories} />
      
      {/* Type assertion needed since getAdminPostById return type is inferred without comments initially, 
          but we just added it to the include statement */}
      <AdminComments comments={(post as any).comments || []} postId={post.id} />
    </div>
  );
}