/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '@/server/repositories/db';
import { toggleLike, addComment } from '@/app/actions/blog';
import { approveComment } from '@/server/services/blogService';
import { testimonialService } from '@/server/services/testimonialService';
import { InquiryService } from '@/server/services/inquiryService';
import { ContactRateLimiter, InMemoryStore } from '@/lib/rate-limit';
import * as testModeModule from '@/lib/test-mode';
import { auth } from '@/auth';
import crypto from 'crypto';

let currentIp = '127.0.0.1';
let currentUserAgent = 'test-agent';

vi.mock('next/headers', () => ({
  headers: () => ({
    get: (key: string) => {
      const k = key.toLowerCase();
      if (k === 'x-forwarded-for') return currentIp;
      if (k === 'user-agent') return currentUserAgent;
      return null;
    }
  })
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

describe('Concurrency & Race-Condition Hardening (B1.b)', () => {
  let adminUser: any;
  let post: any;

  beforeEach(async () => {
    vi.spyOn(testModeModule, 'isTestMode').mockReturnValue(true);

    adminUser = await prisma.adminUser.create({
      data: {
        name: 'Concurrency Admin',
        email: `concurrency-${crypto.randomBytes(4).toString('hex')}@example.com`,
        status: 'ACTIVE'
      }
    });

    vi.mocked(auth).mockResolvedValue({
      user: { id: adminUser.id, email: adminUser.email }
    } as any);

    post = await prisma.blogPost.create({
      data: {
        title: 'Concurrency Post',
        slug: `concurrency-post-${crypto.randomBytes(4).toString('hex')}`,
        excerpt: 'Excerpt',
        body: 'Post body for concurrency testing',
        status: 'PUBLISHED'
      }
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (adminUser?.id) {
      await prisma.auditLog.deleteMany({ where: { actorId: adminUser.id } });
    }
    await prisma.notification.deleteMany({});
    if (post?.id) {
      await prisma.blogLike.deleteMany({ where: { postId: post.id } });
      await prisma.blogComment.deleteMany({ where: { postId: post.id } });
      await prisma.blogPost.deleteMany({ where: { id: post.id } });
    }
    if (adminUser?.id) {
      await prisma.adminUser.deleteMany({ where: { id: adminUser.id } });
    }
    await prisma.testimonial.deleteMany({ where: { name: { startsWith: 'Concurrency' } } });
    await prisma.inquiry.deleteMany({ where: { email: { contains: 'concurrency' } } });
  });

  it('handles 50 parallel likes from distinct voters concurrently without deadlocks', async () => {
    const voterHashes = Array.from({ length: 50 }, (_, i) => `voter_hash_${crypto.randomBytes(8).toString('hex')}_${i}`);

    // Execute 50 concurrent inserts directly simulating parallel distinct voters
    const results = await Promise.allSettled(
      voterHashes.map(voterHash =>
        prisma.blogLike.create({
          data: {
            postId: post.id,
            voterHash
          }
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled');
    expect(succeeded.length).toBe(50);

    const count = await prisma.blogLike.count({ where: { postId: post.id } });
    expect(count).toBe(50);
  });

  it('guarantees double-click safety when the same voter sends parallel like requests', async () => {
    currentIp = '192.168.1.100';
    currentUserAgent = 'Double-Clicker-Agent';

    // Simulate double click: 2 simultaneous toggleLike invocations from same voter
    const [res1, res2] = await Promise.all([
      toggleLike(post.id),
      toggleLike(post.id)
    ]);

    // Both should finish cleanly without unhandled server exceptions
    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);

    // After two toggles by the exact same user, net like count must be either 0 or 1, never duplicated
    const count = await prisma.blogLike.count({ where: { postId: post.id } });
    expect([0, 1]).toContain(count);
  });

  it('handles 20 parallel comments created simultaneously', async () => {
    const commentInputs = Array.from({ length: 20 }, (_, i) => ({
      author: `Commenter ${i}`,
      email: `commenter${i}@example.com`,
      content: `This is parallel comment number ${i} which has sufficient length.`
    }));

    const results = await Promise.allSettled(
      commentInputs.map(input => addComment(post.id, input))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success);
    expect(successful.length).toBe(20);

    const storedComments = await prisma.blogComment.count({ where: { postId: post.id } });
    expect(storedComments).toBe(20);
  });

  it('handles 10 parallel inquiries without data loss or race errors', async () => {
    const mockTransport = {
      send: vi.fn().mockResolvedValue({ status: 'SENT' })
    };
    const inquiryService = new InquiryService(new ContactRateLimiter(new InMemoryStore()), mockTransport as any);

    const inquiryInputs = Array.from({ length: 10 }, (_, i) => ({
      name: `Concurrency User ${i}`,
      email: `concurrency_user_${i}@example.com`,
      message: `Hello, this is a concurrent inquiry message number ${i}.`
    }));

    const results = await Promise.allSettled(
      inquiryInputs.map((input, i) => inquiryService.submitInquiry(input, `10.0.0.${i + 1}`))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success);
    expect(successful.length).toBe(10);

    const inquiriesCount = await prisma.inquiry.count({
      where: { email: { contains: 'concurrency_user_' } }
    });
    expect(inquiriesCount).toBe(10);
  });

  it('records exactly 1 audit log when 10 concurrent requests approve the same comment', async () => {
    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        author: 'Guarded Commenter',
        content: 'This comment needs guarded moderation.',
        status: 'PENDING'
      }
    });

    // 10 concurrent calls to approveComment
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => approveComment(comment.id))
    );

    // All promises must resolve without errors
    expect(results.every(r => r.status === 'fulfilled')).toBe(true);

    // The comment must now be APPROVED
    const finalComment = await prisma.blogComment.findUnique({ where: { id: comment.id } });
    expect(finalComment?.status).toBe('APPROVED');

    // Exactly 1 audit log must be recorded
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity: 'BlogComment',
        entityId: comment.id,
        action: 'APPROVE'
      }
    });
    expect(auditLogs.length).toBe(1);
  });

  it('records exactly 1 audit log when 10 concurrent requests approve the same testimonial', async () => {
    const testimonial = await prisma.testimonial.create({
      data: {
        name: 'Concurrency Testimonial User',
        content: 'Concurrency testimonial with sufficient length to pass validation.',
        status: 'DRAFT',
        permissionStatus: 'PENDING'
      }
    });

    // 10 concurrent calls to approveTestimonial
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => testimonialService.approveTestimonial(testimonial.id))
    );

    expect(results.every(r => r.status === 'fulfilled')).toBe(true);

    const finalTestimonial = await prisma.testimonial.findUnique({ where: { id: testimonial.id } });
    expect(finalTestimonial?.status).toBe('PUBLISHED');
    expect(finalTestimonial?.permissionStatus).toBe('AUTHORIZED');

    // Exactly 1 audit log must be recorded
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity: 'Testimonial',
        entityId: testimonial.id,
        action: 'APPROVE'
      }
    });
    expect(auditLogs.length).toBe(1);
  });
});
