import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '@/server/repositories/db';
import { toggleLike, addComment } from '@/app/actions/blog';
import { blogLikeRateLimiter } from '@/lib/rate-limit';
import * as testModeModule from '@/lib/test-mode';
import crypto from 'crypto';

// Mock headers at top level
vi.mock('next/headers', () => ({
  headers: () => new Map([
    ['x-forwarded-for', '127.0.0.1'],
    ['user-agent', 'test-agent']
  ])
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Blog Likes and Comments Integration', () => {
  let post: any;

  beforeEach(async () => {
    // Override isTestMode to false to actually test rate limiting
    vi.spyOn(testModeModule, 'isTestMode').mockReturnValue(false);

    // Seed a post
    post = await prisma.blogPost.create({
      data: {
        title: 'Test Post',
        slug: `test-post-${crypto.randomBytes(4).toString('hex')}`,
        excerpt: 'Excerpt',
        body: 'Body',
        status: 'PUBLISHED',
      }
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await prisma.blogLike.deleteMany({});
    await prisma.blogComment.deleteMany({});
    await prisma.blogPost.deleteMany({});
  });

  describe('Likes', () => {
    it('toggles a like on and off', async () => {
      // First like
      const res1 = await toggleLike(post.id);
      expect(res1.success).toBe(true);
      expect(res1.likesCount).toBe(1);
      expect(res1.likedByMe).toBe(true);

      // Second like (unlike)
      const res2 = await toggleLike(post.id);
      expect(res2.success).toBe(true);
      expect(res2.likesCount).toBe(0);
      expect(res2.likedByMe).toBe(false);
    });

    it('enforces rate limits on likes', async () => {
      // Consume 10 likes (limit is 10 per minute)
      for (let i = 0; i < 10; i++) {
        await blogLikeRateLimiter.check('127.0.0.1', 'some-hash');
      }

      // 11th should fail
      const res = await blogLikeRateLimiter.check('127.0.0.1', 'some-hash');
      expect(res).toBe(false);
    });
  });

  describe('Comments', () => {
    it('validates comment author and content', async () => {
      const res = await addComment(post.id, { author: 'A', content: 'Too short' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Author must be at least 2 characters');
    });

    it('creates a comment with isApproved=false and sends notification', async () => {
      const res = await addComment(post.id, { author: 'Jane Doe', content: 'This is a valid comment' });
      expect(res.success).toBe(true);

      const dbComment = await prisma.blogComment.findFirst({ where: { postId: post.id } });
      expect(dbComment).toBeDefined();
      expect(dbComment?.isApproved).toBe(false);

      const notif = await prisma.notification.findFirst({ where: { entityId: dbComment?.id } });
      expect(notif).toBeDefined();
      expect(notif?.type).toBe('NEW_COMMENT');
    });
  });
});
