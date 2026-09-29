'use client';

import { useState } from 'react';
import { createBlogPostAction, updateBlogPostAction } from './actions';
import { Button } from '@/components/ui/button';

export default function BlogForm({ post, categories }: { post?: import('@prisma/client').BlogPost, categories: import('@prisma/client').Category[] }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (post) {
        await updateBlogPostAction(post.id, formData);
      } else {
        await createBlogPostAction(formData);
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err;
      }
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2">Title</label>
        <input name="title" defaultValue={post?.title} required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block mb-2">Slug</label>
        <input name="slug" defaultValue={post?.slug} required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block mb-2">Excerpt</label>
        <textarea name="excerpt" defaultValue={post?.excerpt} required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block mb-2">Body (Supports Markdown/Code Blocks)</label>
        <textarea name="body" defaultValue={post?.body} required className="w-full border p-2 rounded h-64 font-mono text-sm" />
      </div>
      <div>
        <label className="block mb-2">Status</label>
        <select name="status" defaultValue={post?.status || 'DRAFT'} className="w-full border p-2 rounded">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div>
        <label className="block mb-2">Category</label>
        <select name="categoryId" defaultValue={post?.categoryId || ''} className="w-full border p-2 rounded">
          <option value="">None</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Post'}
      </Button>
    </form>
  );
}