import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '@/server/repositories/db';
import { toggleLike, addComment } from '@/app/actions/blog';
import { assertLikeHashSecret } from '@/lib/auth/like-secret';
import { approveCommentAction, rejectCommentAction, deleteCommentAction } from '@/app/(admin)/admin/comments/actions';
import { getPublicPostBySlug } from '@/server/services/blogService';
import { toPublicPost } from '@/lib/dto/blogPost';
import { blogLikeRateLimiter, commentRateLimiter } from '@/lib/rate-limit';
import * as testModeModule from '@/lib/test-mode';
import { auth } from '@/auth';
import crypto from 'crypto';

let currentIp = '127.0.0.1';

// Mock headers at top level
vi.mock('next/headers', () => ({
  headers: () => new Map([
    ['x-forwarded-for', currentIp],
    ['user-agent', 'test-agent']
  ])
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

describe('Blog Social Spec (20 Named Tests)', () => {
  let post: any;
  let adminUser: any;

  beforeEach(async () => {
    currentIp = `127.0.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;
    vi.spyOn(testModeModule, 'isTestMode').mockReturnValue(false);

    // Create a mock admin user in DB for audit log actor FK
    adminUser = await prisma.adminUser.create({
      data: {
        name: 'Social Admin',
        email: `social-admin-${crypto.randomBytes(4).toString('hex')}@example.com`,
        status: 'ACTIVE',
      }
    });

    // Default auth mock: authenticated as adminUser
    vi.mocked(auth).mockResolvedValue({
      user: { id: adminUser.id, email: adminUser.email }
    } as any);

    // Seed a published post
    post = await prisma.blogPost.create({
      data: {
        title: 'Social Test Post',
        slug: `social-post-${crypto.randomBytes(4).toString('hex')}`,
        excerpt: 'Excerpt',
        body: 'Body text',
        status: 'PUBLISHED',
      }
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await prisma.auditLog.deleteMany({ where: { actorId: adminUser?.id } });
    await prisma.notification.deleteMany({});
    await prisma.blogLike.deleteMany({});
    await prisma.blogComment.deleteMany({});
    if (post?.id) {
      await prisma.blogPost.deleteMany({ where: { id: post.id } });
    }
    if (adminUser?.id) {
      await prisma.adminUser.deleteMany({ where: { id: adminUser.id } });
    }
  });

  describe('Part A: Likes', () => {
    // 1. toggle semantics
    it('1. Likes: toggle semantics (like -> unlike)', async () => {
      const res1 = await toggleLike(post.id);
      expect(res1.success).toBe(true);
      expect(res1.likesCount).toBe(1);
      expect(res1.likedByMe).toBe(true);

      const res2 = await toggleLike(post.id);
      expect(res2.success).toBe(true);
      expect(res2.likesCount).toBe(0);
      expect(res2.likedByMe).toBe(false);
    });

    // 2. voterHash is HMAC-SHA256 of ip+user-agent
    it('2. Likes: voterHash is HMAC-SHA256 of ip+user-agent keyed by LIKE_HASH_SECRET', async () => {
      process.env.LIKE_HASH_SECRET = 'test-secret-key-123';
      const expectedHash = crypto
        .createHmac('sha256', 'test-secret-key-123')
        .update(`${currentIp}:test-agent`)
        .digest('hex');

      await toggleLike(post.id);

      const likeInDb = await prisma.blogLike.findFirst({ where: { postId: post.id } });
      expect(likeInDb).toBeDefined();
      expect(likeInDb?.voterHash).toBe(expectedHash);
    });

    // 3. startup throws in production if LIKE_HASH_SECRET unset
    it('3. Likes: throws in production if LIKE_HASH_SECRET is unset', () => {
      const origEnv = process.env.APP_ENV;
      const origSecret = process.env.LIKE_HASH_SECRET;
      try {
        process.env.APP_ENV = 'production';
        delete process.env.LIKE_HASH_SECRET;
        expect(() => assertLikeHashSecret()).toThrow('LIKE_HASH_SECRET is missing in production');
      } finally {
        process.env.APP_ENV = origEnv;
        if (origSecret) process.env.LIKE_HASH_SECRET = origSecret;
      }
    });

    // 4. rejected on DRAFT post
    it('4. Likes: rejected on DRAFT post', async () => {
      const draftPost = await prisma.blogPost.create({
        data: {
          title: 'Draft Post',
          slug: `draft-${crypto.randomBytes(4).toString('hex')}`,
          excerpt: 'e',
          body: 'b',
          status: 'DRAFT',
        }
      });
      const res = await toggleLike(draftPost.id);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Post not found');
      await prisma.blogPost.delete({ where: { id: draftPost.id } });
    });

    // 5. rejected on ARCHIVED post
    it('5. Likes: rejected on ARCHIVED post', async () => {
      const archivedPost = await prisma.blogPost.create({
        data: {
          title: 'Archived Post',
          slug: `archived-${crypto.randomBytes(4).toString('hex')}`,
          excerpt: 'e',
          body: 'b',
          status: 'ARCHIVED',
        }
      });
      const res = await toggleLike(archivedPost.id);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Post not found');
      await prisma.blogPost.delete({ where: { id: archivedPost.id } });
    });

    // 6. rejected on non-existent post
    it('6. Likes: rejected on non-existent post', async () => {
      const res = await toggleLike('non-existent-post-id');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Post not found');
    });

    // 7. rate limit enforced
    it('7. Likes: rate limit enforced (rejects after limit exceeded)', async () => {
      for (let i = 0; i < 10; i++) {
        await blogLikeRateLimiter.check('127.0.0.1', 'some-hash');
      }
      const res = await blogLikeRateLimiter.check('127.0.0.1', 'some-hash');
      expect(res).toBe(false);
    });

    // 8. DTO exposes only likesCount and likedByMe, never raw IP or voterHash
    it('8. Likes: DTO exposes only likesCount and likedByMe, no raw IP stored or exposed', () => {
      const publicDto = toPublicPost({
        id: 'p1',
        title: 'Title',
        slug: 'slug',
        excerpt: 'ex',
        body: 'body',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedAt: new Date(),
        categoryId: null,
        featuredImageId: null,
        _count: { likes: 5 },
        likedByMe: true,
      } as any);

      expect(publicDto.likesCount).toBe(5);
      expect(publicDto.likedByMe).toBe(true);
      expect((publicDto as any).voterHash).toBeUndefined();
      expect((publicDto as any).ip).toBeUndefined();
    });
  });

  describe('Parts B & D: Comments', () => {
    // 9. valid submission creates comment with status PENDING and sends notification
    it('9. Comments: valid submission creates comment with status PENDING and sends notification', async () => {
      const res = await addComment(post.id, {
        author: 'Jane Doe',
        email: 'jane@example.com',
        content: 'This is a valid public comment.',
      });
      expect(res.success).toBe(true);

      const dbComment = await prisma.blogComment.findFirst({ where: { postId: post.id } });
      expect(dbComment).toBeDefined();
      expect(dbComment?.status).toBe('PENDING');
      expect(dbComment?.authorEmail).toBe('jane@example.com');

      const notif = await prisma.notification.findFirst({ where: { entityId: dbComment?.id } });
      expect(notif).toBeDefined();
      expect(notif?.type).toBe('NEW_COMMENT');
    });

    // 10. rejected with invalid email
    it('10. Comments: rejected with invalid email', async () => {
      const res = await addComment(post.id, {
        author: 'Jane Doe',
        email: 'not-an-email',
        content: 'This is a valid public comment.',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid email');
    });

    // 11. rejected with content < 3 chars
    it('11. Comments: rejected with content < 3 chars', async () => {
      const res = await addComment(post.id, {
        author: 'Jane Doe',
        email: 'jane@example.com',
        content: 'Hi',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Content must be at least 3 characters');
    });

    // 12. rejected with content > 1000 chars
    it('12. Comments: rejected with content > 1000 chars', async () => {
      const res = await addComment(post.id, {
        author: 'Jane Doe',
        email: 'jane@example.com',
        content: 'A'.repeat(1001),
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Content must be less than 1000 characters');
    });

    // 13. honeypot rejects spam
    it('13. Comments: honeypot rejects spam', async () => {
      const res = await addComment(post.id, {
        author: 'Bot Spammer',
        email: 'bot@spam.com',
        content: 'Click here for free bitcoin',
        honeypot: 'filled_by_bot',
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Spam detected');

      const dbComment = await prisma.blogComment.findFirst({ where: { author: 'Bot Spammer' } });
      expect(dbComment).toBeNull();
    });

    // 14. rate limit enforced
    it('14. Comments: rate limit enforced on comments', async () => {
      for (let i = 0; i < 5; i++) {
        await commentRateLimiter.check('192.168.1.99');
      }
      const allowed = await commentRateLimiter.check('192.168.1.99');
      expect(allowed).toBe(false);
    });

    // 15. rejected on non-PUBLISHED post
    it('15. Comments: rejected on non-PUBLISHED (DRAFT) post', async () => {
      const draftPost = await prisma.blogPost.create({
        data: {
          title: 'Draft Post Comments',
          slug: `draft-c-${crypto.randomBytes(4).toString('hex')}`,
          excerpt: 'e',
          body: 'b',
          status: 'DRAFT',
        }
      });
      const res = await addComment(draftPost.id, {
        author: 'Tester',
        email: 'tester@example.com',
        content: 'Valid comment content',
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Post not found');
      await prisma.blogPost.delete({ where: { id: draftPost.id } });
    });

    // 16. unapproved comments do not appear on public post
    it('16. Comments: unapproved (PENDING or REJECTED) comments do not appear on public post', async () => {
      await prisma.blogComment.create({
        data: {
          postId: post.id,
          author: 'Pending Author',
          authorEmail: 'pending@example.com',
          content: 'Pending comment content',
          status: 'PENDING',
        }
      });
      await prisma.blogComment.create({
        data: {
          postId: post.id,
          author: 'Rejected Author',
          authorEmail: 'rejected@example.com',
          content: 'Rejected comment content',
          status: 'REJECTED',
        }
      });

      const publicPost = await getPublicPostBySlug(post.slug);
      expect(publicPost).toBeDefined();
      expect(publicPost?.comments).toHaveLength(0);
    });

    // 17. approved comments appear on public post without email
    it('17. Comments: approved comments appear on public post with plain text author and content (no email)', async () => {
      await prisma.blogComment.create({
        data: {
          postId: post.id,
          author: 'Approved Author',
          authorEmail: 'secret@example.com',
          content: 'Approved comment content',
          status: 'APPROVED',
        }
      });

      const publicPost = await getPublicPostBySlug(post.slug);
      expect(publicPost).toBeDefined();
      expect(publicPost?.comments).toHaveLength(1);
      expect(publicPost?.comments?.[0].author).toBe('Approved Author');
      expect(publicPost?.comments?.[0].content).toBe('Approved comment content');
      expect((publicPost?.comments?.[0] as any).authorEmail).toBeUndefined();
    });
  });

  describe('Part C: Admin Queue & Audit Logging', () => {
    // 18. approveCommentAction
    it('18. Admin Queue: approveCommentAction requires session, updates status to APPROVED and logs audit entry', async () => {
      const comment = await prisma.blogComment.create({
        data: {
          postId: post.id,
          author: 'To Approve',
          authorEmail: 'approve@example.com',
          content: 'Approval test comment',
          status: 'PENDING',
        }
      });

      // Unauthenticated fails
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      await expect(approveCommentAction(comment.id)).rejects.toThrow('Unauthorized');

      // Authenticated succeeds
      await approveCommentAction(comment.id);

      const updated = await prisma.blogComment.findUnique({ where: { id: comment.id } });
      expect(updated?.status).toBe('APPROVED');
      expect(updated?.moderatedAt).toBeDefined();

      const audit = await prisma.auditLog.findFirst({
        where: { entity: 'BlogComment', entityId: comment.id, action: 'APPROVE' }
      });
      expect(audit).toBeDefined();
      expect(audit?.actorId).toBe(adminUser.id);
    });

    // 19. rejectCommentAction
    it('19. Admin Queue: rejectCommentAction requires session, updates status to REJECTED and logs audit entry', async () => {
      const comment = await prisma.blogComment.create({
        data: {
          postId: post.id,
          author: 'To Reject',
          authorEmail: 'reject@example.com',
          content: 'Reject test comment',
          status: 'PENDING',
        }
      });

      // Unauthenticated fails
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      await expect(rejectCommentAction(comment.id)).rejects.toThrow('Unauthorized');

      // Authenticated succeeds
      await rejectCommentAction(comment.id);

      const updated = await prisma.blogComment.findUnique({ where: { id: comment.id } });
      expect(updated?.status).toBe('REJECTED');
      expect(updated?.moderatedAt).toBeDefined();

      const audit = await prisma.auditLog.findFirst({
        where: { entity: 'BlogComment', entityId: comment.id, action: 'REJECT' }
      });
      expect(audit).toBeDefined();
      expect(audit?.actorId).toBe(adminUser.id);
    });

    // 20. deleteCommentAction
    it('20. Admin Queue: deleteCommentAction requires session, deletes comment and logs audit entry', async () => {
      const comment = await prisma.blogComment.create({
        data: {
          postId: post.id,
          author: 'To Delete',
          authorEmail: 'delete@example.com',
          content: 'Delete test comment',
          status: 'PENDING',
        }
      });

      // Unauthenticated fails
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      await expect(deleteCommentAction(comment.id)).rejects.toThrow('Unauthorized');

      // Authenticated succeeds
      await deleteCommentAction(comment.id);

      const deleted = await prisma.blogComment.findUnique({ where: { id: comment.id } });
      expect(deleted).toBeNull();

      const audit = await prisma.auditLog.findFirst({
        where: { entity: 'BlogComment', entityId: comment.id, action: 'DELETE' }
      });
      expect(audit).toBeDefined();
      expect(audit?.actorId).toBe(adminUser.id);
    });
  });
});
