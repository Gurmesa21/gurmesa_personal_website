import Link from 'next/link';
import { getAdminPosts } from '../../../../server/services/blogService';
import { blogRepository } from '../../../../server/repositories/blogRepository';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteBlogPostAction, createCategoryAction } from './actions';

export const metadata = {
  title: 'Blog Posts',
};

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();
  const categories = await blogRepository.findManyCategories();

  return (
    <div className="space-y-8 p-8 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <Button>Create Post</Button>
        </Link>
      </div>
      
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                <tr className="text-left border-b border-border">
                  <th className="p-4">Title</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map(post => (
                  <tr key={post.id} data-testid="admin-row" className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">{post.title}</td>
                    <td className="p-4 text-sm text-muted-foreground">{post.status}</td>
                    <td className="p-4 space-x-2 whitespace-nowrap">
                      <Link href={`/admin/blog/${post.id}/edit`} data-testid="edit-link">
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/admin/blog/${post.id}/preview`} target="_blank">
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
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="list-disc pl-5 text-muted-foreground">
            {categories.map(c => <li key={c.id}>{c.name} ({c.slug})</li>)}
          </ul>
          <form action={createCategoryAction} className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input name="slug" required />
            </div>
            <Button type="submit" className="mb-0.5">Add Category</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}