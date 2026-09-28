import BlogForm from '../BlogForm';
import { blogRepository } from '../../../../../server/repositories/blogRepository';

export default async function NewBlogPostPage() {
  const categories = await blogRepository.findManyCategories();
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create Blog Post</h1>
      <BlogForm categories={categories} />
    </div>
  );
}