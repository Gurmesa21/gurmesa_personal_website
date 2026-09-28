'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createPost, updatePost, deletePost } from '../../../../server/services/blogService';
import { blogRepository } from '../../../../server/repositories/blogRepository';
import type { BlogPostStatus } from '@prisma/client';

export async function createBlogPostAction(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const body = formData.get('body') as string;
  const status = formData.get('status') as BlogPostStatus;
  const categoryId = formData.get('categoryId') as string || undefined;
  
  await createPost({
    title,
    slug,
    excerpt,
    body,
    status,
    publishedAt: status === 'PUBLISHED' ? new Date() : null,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
  });

  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const body = formData.get('body') as string;
  const status = formData.get('status') as BlogPostStatus;
  const categoryId = formData.get('categoryId') as string || undefined;

  const data: any = {
    title,
    slug,
    excerpt,
    body,
    status,
  };
  
  if (status === 'PUBLISHED') {
    data.publishedAt = new Date();
  }
  
  if (categoryId) {
    data.category = { connect: { id: categoryId } };
  } else {
    data.category = { disconnect: true };
  }

  await updatePost(id, data);

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}

export async function deleteBlogPostAction(id: string) {
  await deletePost(id);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

export async function createCategoryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  await blogRepository.createCategory({ data: { name, slug } });
  revalidatePath('/admin/blog');
}

export async function createTagAction(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  await blogRepository.createTag({ data: { name, slug } });
  revalidatePath('/admin/blog');
}
