import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  headers: () => new Map([
    ['x-forwarded-for', '127.0.0.1'],
    ['user-agent', 'test-agent']
  ])
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/auth', () => ({
  auth: vi.fn()
}));
vi.mock('../../auth', () => ({
  auth: vi.fn()
}));

import { InquiryService } from '@/server/services/inquiryService';
import { TestimonialService } from '@/server/services/testimonialService';
import { addComment } from '@/app/actions/blog';
import { EmailTransport, SendEmailArgs, SendEmailResult } from '@/lib/email';
import * as emailLib from '@/lib/email';
import { InquiryStatus } from '@prisma/client';
import { prisma } from '@/server/repositories/db';

class MockEmailTransport implements EmailTransport {
  public sentEmails: SendEmailArgs[] = [];

  async send(options: SendEmailArgs): Promise<SendEmailResult> {
    this.sentEmails.push(options);
    return {
      id: `mock-msg-${this.sentEmails.length}`,
      status: 'SENT'
    };
  }

  clear() {
    this.sentEmails = [];
  }
}

describe('C2.a Email Matrix Specification', () => {
  const mockTransport = new MockEmailTransport();
  const mockLimiter = {
    check: vi.fn().mockResolvedValue({ allowed: true })
  };

  beforeEach(() => {
    mockTransport.clear();
    vi.clearAllMocks();
    process.env.EMAIL_OWNER_TO = 'owner@example.com';
    process.env.LIKE_HASH_SECRET = 'test-secret';
  });

  describe('1. New Inquiry -> Owner Notification', () => {
    it('sends email to EMAIL_OWNER_TO with Reply-To set to the client email', async () => {
      const service = new InquiryService(mockLimiter as any, mockTransport);
      await service.submitInquiry(
        {
          name: 'Jane Client',
          email: 'jane@client.com',
          message: 'Interested in architecture review and full stack consulting.',
          organization: 'Acme Corp',
          projectType: 'Business website'
        },
        '192.168.1.100'
      );

      const ownerEmail = mockTransport.sentEmails.find(e => e.to === 'owner@example.com');
      expect(ownerEmail).toBeDefined();
      expect(ownerEmail?.replyTo).toBe('jane@client.com');
      expect(ownerEmail?.subject).toContain('New Inquiry from Jane Client');
      expect(ownerEmail?.text).toContain('Name: Jane Client');
      expect(ownerEmail?.text).toContain('Email: jane@client.com');
      expect(ownerEmail?.text).toContain('Organization: Acme Corp');
      expect(ownerEmail?.text).toContain('Interested in architecture review');
    });
  });

  describe('2. New Inquiry -> Client Acknowledgement', () => {
    it('acknowledges in English by default when toggle is ON', async () => {
      await prisma.siteSetting.upsert({
        where: { key: 'sendVisitorAcknowledgement' },
        update: { value: 'true' },
        create: { key: 'sendVisitorAcknowledgement', value: 'true', type: 'boolean' }
      });

      const service = new InquiryService(mockLimiter as any, mockTransport);
      await service.submitInquiry(
        {
          name: 'John Client',
          email: 'john@client.com',
          message: 'Hello, need an engineering estimate.',
          locale: 'en'
        },
        '192.168.1.101'
      );

      const ack = mockTransport.sentEmails.find(e => e.to === 'john@client.com');
      expect(ack).toBeDefined();
      expect(ack?.subject).toBe('Thank you for your inquiry');
      expect(ack?.text).toContain('We have received your inquiry and will get back to you shortly.');
    });

    it('acknowledges in Amharic when form locale is am', async () => {
      await prisma.siteSetting.upsert({
        where: { key: 'sendVisitorAcknowledgement' },
        update: { value: 'true' },
        create: { key: 'sendVisitorAcknowledgement', value: 'true', type: 'boolean' }
      });

      const service = new InquiryService(mockLimiter as any, mockTransport);
      await service.submitInquiry(
        {
          name: 'አበበ ደበበ',
          email: 'abebe@client.com',
          message: 'የፕሮጀክት ማማከር አገልግሎት እፈልጋለሁ።',
          locale: 'am'
        },
        '192.168.1.102'
      );

      const ack = mockTransport.sentEmails.find(e => e.to === 'abebe@client.com');
      expect(ack).toBeDefined();
      expect(ack?.subject).toBe('ስለ ጥያቄዎ እናመሰግናለን');
      expect(ack?.text).toContain('ጥያቄዎ ደርሶናል፤ በቅርቡ ምላሽ እንሰጣለን።');
    });

    it('acknowledges in Afaan Oromoo when form locale is om', async () => {
      await prisma.siteSetting.upsert({
        where: { key: 'sendVisitorAcknowledgement' },
        update: { value: 'true' },
        create: { key: 'sendVisitorAcknowledgement', value: 'true', type: 'boolean' }
      });

      const service = new InquiryService(mockLimiter as any, mockTransport);
      await service.submitInquiry(
        {
          name: 'Caalaa',
          email: 'chala@client.com',
          message: 'Tajaajila gorsaa barbaanna.',
          locale: 'om'
        },
        '192.168.1.103'
      );

      const ack = mockTransport.sentEmails.find(e => e.to === 'chala@client.com');
      expect(ack).toBeDefined();
      expect(ack?.subject).toBe('Gaaffii keessaniif galatoomaa');
      expect(ack?.text).toContain('Gaaffiin keessan nu gaheera; dhiyootti deebii isiniif kennina.');
    });

    it('does NOT acknowledge when toggle is OFF', async () => {
      await prisma.siteSetting.upsert({
        where: { key: 'sendVisitorAcknowledgement' },
        update: { value: 'false' },
        create: { key: 'sendVisitorAcknowledgement', value: 'false', type: 'boolean' }
      });

      const service = new InquiryService(mockLimiter as any, mockTransport);
      await service.submitInquiry(
        {
          name: 'Silent Client',
          email: 'silent@client.com',
          message: 'Just checking prices.',
          locale: 'en'
        },
        '192.168.1.104'
      );

      const ack = mockTransport.sentEmails.find(e => e.to === 'silent@client.com');
      expect(ack).toBeUndefined();
    });
  });

  describe('3. Inquiry Status Change -> Client Notification', () => {
    it('does NOT notify client by default (notifyClient is false)', async () => {
      const inquiry = await prisma.inquiry.create({
        data: {
          name: 'Test Client',
          email: 'test@client.com',
          message: 'Test message for status update',
          status: InquiryStatus.NEW
        }
      });

      const service = new InquiryService(mockLimiter as any, mockTransport);
      // Mock auth session
      (service as any).requireAuth = vi.fn().mockResolvedValue({ id: 'admin-1', email: 'admin@example.com' });

      await service.updateStatus(inquiry.id, InquiryStatus.QUALIFIED, false);

      const clientEmail = mockTransport.sentEmails.find(e => e.to === 'test@client.com');
      expect(clientEmail).toBeUndefined();
    });

    it('notifies client when notifyClient is true and status is eligible (e.g. QUALIFIED)', async () => {
      const inquiry = await prisma.inquiry.create({
        data: {
          name: 'Notified Client',
          email: 'notified@client.com',
          message: 'Need full stack contract.',
          status: InquiryStatus.NEW
        }
      });

      const service = new InquiryService(mockLimiter as any, mockTransport);
      (service as any).requireAuth = vi.fn().mockResolvedValue({ id: 'admin-1', email: 'admin@example.com' });

      await service.updateStatus(inquiry.id, InquiryStatus.QUALIFIED, true, 'en');

      const clientEmail = mockTransport.sentEmails.find(e => e.to === 'notified@client.com');
      expect(clientEmail).toBeDefined();
      expect(clientEmail?.subject).toContain('Status: QUALIFIED');
      expect(clientEmail?.text).toContain('Hello Notified Client');
      expect(clientEmail?.text).toContain('status has been updated to: QUALIFIED');
    });

    it('NEVER notifies client when status is LOST or ARCHIVED, even if notifyClient is true', async () => {
      const inquiry = await prisma.inquiry.create({
        data: {
          name: 'Lost Client',
          email: 'lost@client.com',
          message: 'Budget too small.',
          status: InquiryStatus.CONTACTED
        }
      });

      const service = new InquiryService(mockLimiter as any, mockTransport);
      (service as any).requireAuth = vi.fn().mockResolvedValue({ id: 'admin-1', email: 'admin@example.com' });

      // Attempt LOST with notifyClient = true
      await service.updateStatus(inquiry.id, InquiryStatus.LOST, true);
      expect(mockTransport.sentEmails.find(e => e.to === 'lost@client.com')).toBeUndefined();

      // Attempt ARCHIVED with notifyClient = true
      await service.updateStatus(inquiry.id, InquiryStatus.ARCHIVED, true);
      expect(mockTransport.sentEmails.find(e => e.to === 'lost@client.com')).toBeUndefined();
    });
  });

  describe('4. New Testimonial -> Owner Notification', () => {
    it('sends email to EMAIL_OWNER_TO with author details and content', async () => {
      const service = new TestimonialService(mockTransport);
      await service.submitPublicTestimonial({
        name: 'Sarah Connor',
        role: 'CTO',
        organization: 'Cyberdyne Systems',
        content: 'Exceptional engineering quality and delivered ahead of schedule.',
        status: 'DRAFT',
        permissionStatus: 'PENDING'
      });

      const ownerEmail = mockTransport.sentEmails.find(e => e.to === 'owner@example.com');
      expect(ownerEmail).toBeDefined();
      expect(ownerEmail?.subject).toContain('New Testimonial Submission from Sarah Connor');
      expect(ownerEmail?.text).toContain('Sarah Connor');
      expect(ownerEmail?.text).toContain('Cyberdyne Systems');
      expect(ownerEmail?.text).toContain('Exceptional engineering quality');
    });
  });

  describe('5. New Comment -> Owner Notification', () => {
    it('sends email to EMAIL_OWNER_TO with comment author, post title, and text', async () => {
      vi.spyOn(emailLib, 'getEmailTransport').mockReturnValue(mockTransport);

      // Find or create a published post
      let post = await prisma.blogPost.findFirst({ where: { status: 'PUBLISHED' } });
      if (!post) {
        post = await prisma.blogPost.create({
          data: {
            title: 'Matrix Architecture Insights',
            slug: 'matrix-architecture-insights',
            excerpt: 'Deep dive into event-driven patterns',
            body: 'Full article content here.',
            status: 'PUBLISHED'
          }
        });
      }

      // Submit comment using addComment
      const result = await addComment(post.id, {
        author: 'Alex Reviewer',
        email: 'alex@reviewer.io',
        content: 'Superb writeup on distributed systems and event notifications.'
      });

      expect(result.success).toBe(true);

      const commentEmail = mockTransport.sentEmails.find(e => e.to === 'owner@example.com' && e.subject.includes('New Blog Comment'));
      expect(commentEmail).toBeDefined();
      expect(commentEmail?.replyTo).toBe('alex@reviewer.io');
      expect(commentEmail?.subject).toContain(post.title);
      expect(commentEmail?.text).toContain('Alex Reviewer');
      expect(commentEmail?.text).toContain('alex@reviewer.io');
      expect(commentEmail?.text).toContain('Superb writeup on distributed systems');
    });
  });
});
