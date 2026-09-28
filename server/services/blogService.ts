import { blogRepository } from '../repositories/blogRepository';
import { toPublicPost, type PublicBlogPost } from '../../lib/dto/blogPost';
import { auth } from '../../auth';
import type { Prisma } from '@prisma/client';

export const getPublicPosts = async (filters?: { category?: string; tag?: string; search?: string }): Promise<PublicBlogPost[]> => {
  const where: Prisma.BlogPostWhereInput = {
    status: 'PUBLISHED',
  };

  if (filters?.category) {
    where.category = { slug: filters.category };
  }
  if (filters?.tag) {
    where.tags = { some: { tag: { slug: filters.tag } } };
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
      { tags: { some: { tag: { name: { contains: filters.search, mode: 'insensitive' } } } } }
    ];
  }

  const posts = await blogRepository.findMany({
    where,
    include: {
      category: true,
      featuredImage: true,
      tags: { include: { tag: true } }
    },
    orderBy: { publishedAt: 'desc' }
  });

  return posts.map(toPublicPost);
};

export const getPublicPostBySlug = async (slug: string): Promise<PublicBlogPost | null> => {
  const post = await blogRepository.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      category: true,
      featuredImage: true,
      tags: { include: { tag: true } }
    }
  });

  if (!post) return null;
  return toPublicPost(post);
};

export const getAdminPosts = async () => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return blogRepository.findMany({
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { updatedAt: 'desc' }
  });
};

export const getAdminPostById = async (id: string) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return blogRepository.findFirst({
    where: { id },
    include: { category: true, tags: { include: { tag: true } }, featuredImage: true }
  });
};

export const createPost = async (data: Prisma.BlogPostCreateInput) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return blogRepository.create({ data });
};

export const updatePost = async (id: string, data: Prisma.BlogPostUpdateInput) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return blogRepository.update({ where: { id }, data });
};

export const deletePost = async (id: string) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return blogRepository.delete({ where: { id } });
};

export const getPreviewPostBySlug = async (slug: string) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  
  const post = await blogRepository.findFirst({
    where: { slug },
    include: {
      category: true,
      featuredImage: true,
      tags: { include: { tag: true } }
    }
  });

  if (!post) return null;
  return toPublicPost(post);
};
