import Link from 'next/link';
import { getAdminPosts } from '../../../../server/services/blogService';
import { blogRepository } from '../../../../server/repositories/blogRepository';
import { Button } from '@/components/ui/button';
import { deleteBlogPostAction, createCategoryAction } from './actions';

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();
  const categories = await blogRepository.findManyCategories();

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <Button>Create Post</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Title</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b">
                <td className="py-2">{post.title}</td>
                <td className="py-2">{post.status}</td>
                <td className="py-2 space-x-2">
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Link href={`/api/preview?slug=${post.slug}`} target="_blank">
                    <Button variant="outline" size="sm">Preview</Button>
                  </Link>
                  <form action={async () => {
                    'use server';
                    await deleteBlogPostAction(post.id);
                  }} className="inline">
                    <Button variant="destructive" size="sm" type="submit">Delete</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <ul className="list-disc pl-5">
          {categories.map(c => <li key={c.id}>{c.name} ({c.slug})</li>)}
        </ul>
        <form action={createCategoryAction} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm">Name</label>
            <input name="name" required className="border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Slug</label>
            <input name="slug" required className="border p-2 rounded" />
          </div>
          <Button type="submit">Add Category</Button>
        </form>
      </div>
    </div>
  );
}