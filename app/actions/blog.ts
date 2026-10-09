'use server';

import { prisma } from '@/server/repositories/db';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { getIpFromHeaders, blogLikeRateLimiter } from '@/lib/rate-limit';

function getVoterHash(ip: string, userAgent: string): string {
  const secret = process.env.LIKE_HASH_SECRET;
  if (!secret) {
    if (process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production') {
      throw new Error('LIKE_HASH_SECRET is missing in production');
    }
    return crypto.createHmac('sha256', 'dev-secret').update(`${ip}:${userAgent}`).digest('hex');
  }
  return crypto.createHmac('sha256', secret).update(`${ip}:${userAgent}`).digest('hex');
}

export async function toggleLike(postId: string) {
  try {
    const headersList = await headers();
    const ip = getIpFromHeaders(headersList);
    const userAgent = headersList.get('user-agent') || 'unknown';
    const voterHash = getVoterHash(ip, userAgent);

    const allowed = await blogLikeRateLimiter.check(ip, voterHash);
    if (!allowed) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'PUBLISHED') {
      return { success: false, error: 'Post not found' };
    }

    const existingLike = await prisma.blogLike.findUnique({
      where: {
        postId_voterHash: {
          postId,
          voterHash
        }
      }
    });

    if (existingLike) {
      await prisma.blogLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.blogLike.create({
        data: {
          postId,
          voterHash
        }
      });
    }

    const likesCount = await prisma.blogLike.count({ where: { postId } });
    const likedByMe = !existingLike;

    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);

    return { success: true, likesCount, likedByMe };
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

import { z } from 'zod';
import { commentRateLimiter } from '@/lib/rate-limit';
import { createNotification } from '@/lib/notifications';

const commentSchema = z.object({
  author: z.string().min(2, 'Author must be at least 2 characters').max(50, 'Author must be less than 50 characters'),
  content: z.string().min(5, 'Content must be at least 5 characters').max(1000, 'Content must be less than 1000 characters')
});

export async function addComment(postId: string, data: { author: string, content: string }) {
  try {
    const validatedData = commentSchema.parse(data);
    
    const headersList = await headers();
    const ip = getIpFromHeaders(headersList);

    const allowed = await commentRateLimiter.check(ip);
    if (!allowed) {
      return { success: false, error: 'Rate limit exceeded' };
    }

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'PUBLISHED') {
      return { success: false, error: 'Post not found' };
    }

    const comment = await prisma.blogComment.create({
      data: {
        postId,
        author: validatedData.author,
        content: validatedData.content,
        isApproved: false,
      }
    });

    await createNotification({
      type: 'NEW_COMMENT',
      entityId: comment.id,
      message: `New comment by ${comment.author} on post "${post.title}"`
    });

    return { success: true, message: 'Comment submitted for moderation' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || 'Validation failed';
      return { success: false, error: msg };
    }
    console.error('Failed to add comment:', error);
    return { success: false, error: 'Failed to post comment' };
  }
}
