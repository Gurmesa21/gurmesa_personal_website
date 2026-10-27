import BlogForm from '../BlogForm';
import { blogRepository } from '../../../../../server/repositories/blogRepository';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function NewBlogPostPage() {
  const categories = await blogRepository.findManyCategories();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create Blog Post</h1>
          <p className="text-sm text-muted-foreground mt-1">Draft or publish a new article on your developer blog.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/blog">&larr; Back to Blog</Link>
        </Button>
      </div>
      <BlogForm categories={categories} />
    </div>
  );
}