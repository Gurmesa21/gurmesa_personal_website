'use client';

import { useState } from 'react';
import { createBlogPostAction, updateBlogPostAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MediaPicker } from '@/components/admin/MediaPicker';

export default function BlogForm({ post, categories }: { post?: import('@prisma/client').BlogPost, categories: import('@prisma/client').Category[] }) {
  const [loading, setLoading] = useState(false);
  const [featuredImageId, setFeaturedImageId] = useState(post?.featuredImageId || '');

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
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={post?.title} required placeholder="Enter post title..." className="bg-card text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={post?.slug} required placeholder="e.g. how-to-build-scalable-apis" className="bg-card text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" name="excerpt" rows={3} defaultValue={post?.excerpt} required placeholder="Brief summary of the article..." className="bg-card text-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body (Supports Markdown/Code Blocks)</Label>
            <Textarea id="body" name="body" defaultValue={post?.body} required className="h-64 font-mono text-sm leading-relaxed bg-card text-foreground" placeholder="# Introduction&#10;&#10;Write your post content here..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={post?.status || 'DRAFT'}
                className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-card text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="DRAFT" className="bg-[#101426] text-[#F5F6FC]">Draft</option>
                <option value="PUBLISHED" className="bg-[#101426] text-[#F5F6FC]">Published</option>
                <option value="ARCHIVED" className="bg-[#101426] text-[#F5F6FC]">Archived</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={post?.categoryId || ''}
                className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-card text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" className="bg-[#101426] text-[#F5F6FC]">None</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#101426] text-[#F5F6FC]">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Featured Image</Label>
            <MediaPicker name="featuredImageId" value={featuredImageId} onChange={setFeaturedImageId} />
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Saving Post...' : 'Save Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}