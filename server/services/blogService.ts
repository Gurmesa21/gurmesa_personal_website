import { prisma } from '../repositories/db';
import { blogRepository } from '../repositories/blogRepository';
import { toPublicPost, type PublicBlogPost } from '../../lib/dto/blogPost';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';
import type { Prisma, CommentStatus } from '@prisma/client';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { getIpFromHeaders } from '@/lib/rate-limit';
import { assertLikeHashSecret } from '@/lib/auth/like-secret';

assertLikeHashSecret();

async function getCurrentVoterHash(): Promise<string | null> {
  try {
    const headersList = await headers();
    const ip = getIpFromHeaders(headersList);
    const userAgent = headersList.get('user-agent') || 'unknown';
    const secret = process.env.LIKE_HASH_SECRET || 'dev-secret';
    return crypto.createHmac('sha256', secret).update(`${ip}:${userAgent}`).digest('hex');
  } catch {
    return null; // Might happen if not in a request context
  }
}

export const getPublicPosts = async (filters?: { category?: string; tag?: string; search?: string; limit?: number }): Promise<PublicBlogPost[]> => {
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
    take: filters?.limit,
    include: {
      category: true,
      featuredImage: true,
      tags: { include: { tag: true } },
      _count: { select: { likes: true } }
    },
    orderBy: { publishedAt: 'desc' }
  });

  const voterHash = await getCurrentVoterHash();
  let userLikes = new Set<string>();
  if (voterHash && posts.length > 0) {
    const likes = await prisma.blogLike.findMany({
      where: {
        voterHash,
        postId: { in: posts.map(p => p.id) }
      }
    });
    userLikes = new Set(likes.map((l: { postId: string }) => l.postId));
  }

  return posts.map(p => toPublicPost({ ...p, likedByMe: userLikes.has(p.id) }));
};

export const getPublicPostBySlug = async (slug: string): Promise<PublicBlogPost | null> => {
  const post = await blogRepository.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      category: true,
      featuredImage: true,
      tags: { include: { tag: true } },
      _count: { select: { likes: true } },
      comments: { 
        where: { status: 'APPROVED' }, 
        orderBy: { createdAt: 'desc' } 
      }
    }
  });

  if (!post) return null;
  
  let likedByMe = false;
  const voterHash = await getCurrentVoterHash();
  if (voterHash) {
    const like = await prisma.blogLike.findUnique({
      where: { postId_voterHash: { postId: post.id, voterHash } }
    });
    likedByMe = !!like;
  }

  return toPublicPost({ ...post, likedByMe });
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
    include: { 
      category: true, 
      tags: { include: { tag: true } }, 
      featuredImage: true,
      comments: { orderBy: { createdAt: 'desc' } }
    }
  });
};

export const createPost = async (data: Prisma.BlogPostCreateInput) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await blogRepository.create({ data });
  await logAdminAction({ action: 'CREATE', entity: 'BlogPost', entityId: result.id });
  return result;
};

export const updatePost = async (id: string, data: Prisma.BlogPostUpdateInput) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await blogRepository.update({ where: { id }, data });
  await logAdminAction({ action: 'UPDATE', entity: 'BlogPost', entityId: id, metadata: data });
  return result;
};

export const deletePost = async (id: string) => {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await blogRepository.delete({ where: { id } });
  await logAdminAction({ action: 'DELETE', entity: 'BlogPost', entityId: id });
  return result;
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

export const getAdminComments = async (statusFilter?: 'ALL' | CommentStatus) => {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  
  const where = statusFilter && statusFilter !== 'ALL' ? { status: statusFilter } : {};
  return prisma.blogComment.findMany({
    where,
    include: {
      post: {
        select: { id: true, title: true, slug: true }
      }
    },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' }
    ]
  });
};

export const approveComment = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const comment = await prisma.blogComment.update({
    where: { id },
    data: { status: 'APPROVED', moderatedAt: new Date() },
    include: { post: true }
  });
  
  await logAdminAction({ action: 'APPROVE', entity: 'BlogComment', entityId: id, actorId: session.user.id });
  revalidatePath('/admin/comments');
  if (comment.post) {
    revalidatePath(`/blog/${comment.post.slug}`);
  }
  return comment;
};

export const rejectComment = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const comment = await prisma.blogComment.update({
    where: { id },
    data: { status: 'REJECTED', moderatedAt: new Date() },
    include: { post: true }
  });
  
  await logAdminAction({ action: 'REJECT', entity: 'BlogComment', entityId: id, actorId: session.user.id });
  revalidatePath('/admin/comments');
  if (comment.post) {
    revalidatePath(`/blog/${comment.post.slug}`);
  }
  return comment;
};

export const deleteComment = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  const comment = await prisma.blogComment.delete({
    where: { id },
    include: { post: true }
  });
  
  await logAdminAction({ action: 'DELETE', entity: 'BlogComment', entityId: id, actorId: session.user.id });
  revalidatePath('/admin/comments');
  if (comment.post) {
    revalidatePath(`/blog/${comment.post.slug}`);
  }
  return comment;
};
