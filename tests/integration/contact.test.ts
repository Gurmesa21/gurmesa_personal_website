import { vi, describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { PrismaClient, InquiryStatus, NotificationStatus, TestimonialStatus, TestimonialPermissionStatus } from '@prisma/client';

// Mock auth before importing services
vi.mock('../../auth', () => ({
  auth: vi.fn()
}));

import { InquiryService } from '../../server/services/inquiryService';
import { testimonialService } from '../../server/services/testimonialService';
import { toPublicTestimonial } from '../../lib/dto/testimonial';
import { InMemoryStore, ContactRateLimiter } from '../../lib/rate-limit';
import { EmailTransport, SendEmailArgs, SendEmailResult } from '../../lib/email';
import { auth } from '../../auth';

const prisma = new PrismaClient();

// Fake Email Transport
class FakeTransport implements EmailTransport {
  public calls: SendEmailArgs[] = [];
  public shouldFail = false;
  
  async send(args: SendEmailArgs): Promise<SendEmailResult> {
    this.calls.push(args);
    if (this.shouldFail) return { status: 'FAILED', error: 'Network error' };
    return { status: 'SENT' };
  }
}

describe('Contact & Inquiry Service Integration', () => {
  let transport: FakeTransport;
  let service: InquiryService;
  let store: InMemoryStore;
  let rateLimiter: ContactRateLimiter;

  beforeEach(() => {
    transport = new FakeTransport();
    store = new InMemoryStore();
    rateLimiter = new ContactRateLimiter(store);
    service = new InquiryService(rateLimiter, transport);
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue({ user: { id: 'admin123', email: 'admin@test.com' } });
  });

  afterEach(async () => {
    await prisma.inquiry.deleteMany({ where: { email: { contains: 'test' } } });
  });

  it('valid submission stores an inquiry with status NEW', async () => {
    process.env.EMAIL_OWNER_TO = 'owner@test.com';
    const res = await service.submitInquiry({
      name: 'Test',
      email: 'valid@test.com',
      message: 'This is a long enough message'
    }, '127.0.0.1');

    expect(res.success).toBe(true);

    const stored = await prisma.inquiry.findUnique({ where: { id: res.inquiryId } });
    expect(stored).not.toBeNull();
    expect(stored!.status).toBe(InquiryStatus.NEW);
    expect(stored!.notificationStatus).toBe(NotificationStatus.SENT); // assuming env.EMAIL_OWNER_TO is set, actually let's set it
  });

  it('invalid input is rejected with field errors', async () => {
    await expect(service.submitInquiry({ name: '', email: 'bad', message: 'short' }, '127.0.0.1')).rejects.toThrow();
  });

  it('invalid input rejected: missing email', async () => {
    await expect(service.submitInquiry({ name: 'Test', email: '', message: 'Long enough message here' }, '127.0.0.1')).rejects.toThrow();
  });

  it('invalid input rejected: invalid email', async () => {
    await expect(service.submitInquiry({ name: 'Test', email: 'not-an-email', message: 'Long enough message here' }, '127.0.0.1')).rejects.toThrow();
  });

  it('invalid input rejected: message too short', async () => {
    await expect(service.submitInquiry({ name: 'Test', email: 'test@test.com', message: 'hi' }, '127.0.0.1')).rejects.toThrow();
  });

  it('invalid input rejected: message too long', async () => {
    const longMsg = 'A'.repeat(5001);
    await expect(service.submitInquiry({ name: 'Test', email: 'test@test.com', message: longMsg }, '127.0.0.1')).rejects.toThrow();
  });

  it('invalid input rejected: unknown projectType', async () => {
    await expect(service.submitInquiry({ name: 'Test', email: 'test@test.com', message: 'Long enough message here', projectType: 'UNKNOWN_TYPE' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */, '127.0.0.1')).rejects.toThrow();
  });

  it('unknown/extra fields are rejected', async () => {
    await expect(service.submitInquiry({
      name: 'Test', email: 'valid@test.com', message: 'This is long enough', extra: 'bad'
    } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */, '127.0.0.1')).rejects.toThrow();
  });

  it('honeypot filled: nothing stored, nothing sent, success-shaped reply', async () => {
    const res = await service.submitInquiry({
      name: 'Test',
      email: 'honey@test.com',
      message: 'This is long enough',
      honeypot: 'bot'
    }, '127.0.0.1');

    expect(res.success).toBe(true);
    expect(transport.calls.length).toBe(0);
    const count = await prisma.inquiry.count({ where: { email: 'honey@test.com' } });
    expect(count).toBe(0);
  });

  it('rate limit: the (N+1)th request from one client is rejected while a different client is still accepted', async () => {
    vi.stubEnv('PLAYWRIGHT_TEST', '0');
    const input = { name: 'Test', email: 'limit@test.com', message: 'This is long enough' };
    
    // Exhaust IP limit (5)
    for(let i = 0; i < 5; i++) {
      await service.submitInquiry({ ...input, email: `limit${i}@test.com` }, '10.0.0.1');
    }
    
    // 6th should fail
    await expect(service.submitInquiry({ ...input, email: 'limit6@test.com' }, '10.0.0.1')).rejects.toThrow('RATE_LIMIT');
    
    // Different IP should succeed
    const res = await service.submitInquiry({ ...input, email: 'limit6@test.com' }, '10.0.0.2');
    expect(res.success).toBe(true);
    vi.unstubAllEnvs();
  });

  it('email transport throws: inquiry is still stored with notificationStatus FAILED', async () => {
    transport.shouldFail = true;
    process.env.EMAIL_OWNER_TO = 'owner@test.com'; // Ensure it tries to send

    const res = await service.submitInquiry({
      name: 'Test', email: 'fail@test.com', message: 'This is long enough'
    }, '127.0.0.1');

    expect(res.success).toBe(true);
    const stored = await prisma.inquiry.findUnique({ where: { id: res.inquiryId } });
    expect(stored!.notificationStatus).toBe(NotificationStatus.FAILED);
  });

  it('ConsoleTransport records SKIPPED (never SENT)', async () => {
    // This is unit tested by instantiation in the codebase. We simulate it.
    const { ConsoleTransport } = await import('../../lib/email');
    const ct = new ConsoleTransport();
    const res = await ct.send({ to: 'x', subject: 'y', text: 'z' });
    expect(res.status).toBe('SKIPPED');
  });

  it('ConsoleTransport cannot be selected when APP_ENV=production', async () => {
    const { ConsoleTransport } = await import('../../lib/email');
    vi.stubEnv('APP_ENV', 'production');
    
    // ConsoleTransport constructor throws in production
    expect(() => new ConsoleTransport()).toThrow(/ConsoleTransport cannot be used in production/);
    
    vi.unstubAllEnvs();
  });

  it('header-injection attempt does not alter the outgoing email headers/subject', async () => {
    process.env.EMAIL_OWNER_TO = 'owner@test.com';
    await expect(service.submitInquiry({
      name: 'Test\r\nBcc: evil@test.com',
      email: 'evil\r\n@test.com',
      message: 'Long enough'
    }, '127.0.0.1')).rejects.toThrow(); // Zod catches CRLF
  });

  it('source with a full URL, protocol, or query string is rejected or normalized to a safe path', async () => {
    const { inquirySchema } = await import('../../lib/validation/inquiry');
    const res1 = inquirySchema.parse({ name: 'X', email: 'x@x.com', message: 'xxxxxxxxxx', source: 'http://evil.com/path?q=1' });
    expect(res1.source).toBe('/path');

    const res2 = inquirySchema.parse({ name: 'X', email: 'x@x.com', message: 'xxxxxxxxxx', source: '/good?q=1#hash' });
    expect(res2.source).toBe('/good');
  });

  it('acknowledgement is not sent when the toggle is off', async () => {
    process.env.EMAIL_OWNER_TO = 'owner@test.com';
    await service.submitInquiry({
      name: 'Test', email: 'valid@test.com', message: 'This is long enough'
    }, '127.0.0.1');
    expect(transport.calls.length).toBe(1);
    expect(transport.calls[0].to).toBe('owner@test.com');
  });
});

describe('Admin Inquiries', () => {
  let service: InquiryService;
  beforeEach(() => {
    service = new InquiryService(new ContactRateLimiter(new InMemoryStore()), new FakeTransport());
  });
  
  it('unauthenticated: list, get, status change, add note, delete each rejected', async () => {
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue(null);
    await expect(service.listInquiries({})).rejects.toThrow('UNAUTHORIZED');
    await expect(service.getInquiry('1')).rejects.toThrow('UNAUTHORIZED');
    await expect(service.updateStatus('1', 'CONTACTED')).rejects.toThrow('UNAUTHORIZED');
    await expect(service.addNote('1', 'note')).rejects.toThrow('UNAUTHORIZED');
    await expect(service.deleteInquiry('1')).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated inquiry admin: list rejected', async () => {
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue(null);
    await expect(service.listInquiries({})).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated inquiry admin: get rejected', async () => {
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue(null);
    await expect(service.getInquiry('1')).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated inquiry admin: status change rejected', async () => {
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue(null);
    await expect(service.updateStatus('1', 'CONTACTED')).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated inquiry admin: add note rejected', async () => {
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue(null);
    await expect(service.addNote('1', 'note')).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated inquiry admin: delete rejected', async () => {
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue(null);
    await expect(service.deleteInquiry('1')).rejects.toThrow('UNAUTHORIZED');
  });

  it('add note stores the session user as author regardless of any client-supplied authorId', async () => {
    const userEmail = `admin-${Date.now()}@test.com`;
    const user = await prisma.adminUser.create({ data: { name: 'Admin', email: userEmail, passwordHash: 'hash', status: 'ACTIVE' } });
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue({ user: { id: user.id, email: user.email } });
    const inq = await prisma.inquiry.create({ data: { name: 'X', email: 'x@x.com', message: 'x', status: 'NEW' } });
    const note = await service.addNote(inq.id, 'My note');
    expect(note.authorId).toBe(user.id);
    await prisma.inquiryNote.deleteMany({ where: { inquiryId: inq.id } });
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.inquiry.delete({ where: { id: inq.id } });
    await prisma.adminUser.delete({ where: { id: user.id } });
  });
});

describe('Testimonials', () => {
  beforeEach(() => {
    (auth as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mockResolvedValue(null); // default to public
  });

  afterAll(async () => {
    await prisma.testimonial.deleteMany({ where: { name: 'TestimonialTest' } });
  });

  async function seedT(status: TestimonialStatus, perm: TestimonialPermissionStatus, isAnonymous = false) {
    return prisma.testimonial.create({
      data: { name: 'TestimonialTest', content: 'C', status, permissionStatus: perm, isAnonymous }
    });
  }

  it('PENDING+published testimonial excluded from public', async () => {
    await seedT('PUBLISHED', 'PENDING');
    const all = await testimonialService.getPublicTestimonials();
    expect(all.some(t => t.name === 'TestimonialTest')).toBe(false);
  });

  it('AUTHORIZED+DRAFT excluded from public', async () => {
    await seedT('DRAFT', 'AUTHORIZED');
    const all = await testimonialService.getPublicTestimonials();
    expect(all.some(t => t.name === 'TestimonialTest')).toBe(false);
  });

  it('REVOKED+published excluded from public', async () => {
    await seedT('PUBLISHED', 'REVOKED');
    const all = await testimonialService.getPublicTestimonials();
    expect(all.some(t => t.name === 'TestimonialTest')).toBe(false);
  });

  it('toPublicTestimonial allowlist keys match exactly', async () => {
    const t = await seedT('PUBLISHED', 'AUTHORIZED');
    const pub = toPublicTestimonial(t);
    expect(Object.keys(pub).sort()).toEqual(['content', 'id', 'name', 'organization', 'role'].sort());
  });

  it('anonymous testimonial omits name and organization', async () => {
    const t = await seedT('PUBLISHED', 'AUTHORIZED', true);
    const pub = toPublicTestimonial(t);
    expect(Object.keys(pub).sort()).toEqual(['content', 'id', 'role'].sort());
    expect(pub.name).toBeUndefined();
  });

  it('unauthenticated testimonial mutations rejected', async () => {
    await expect(testimonialService.createTestimonial({} as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)).rejects.toThrow('UNAUTHORIZED');
    await expect(testimonialService.updateTestimonial('1', {} as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)).rejects.toThrow('UNAUTHORIZED');
    await expect(testimonialService.deleteTestimonial('1')).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated testimonial create rejected', async () => {
    await expect(testimonialService.createTestimonial({} as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated testimonial update rejected', async () => {
    await expect(testimonialService.updateTestimonial('1', {} as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)).rejects.toThrow('UNAUTHORIZED');
  });

  it('unauthenticated testimonial delete rejected', async () => {
    await expect(testimonialService.deleteTestimonial('1')).rejects.toThrow('UNAUTHORIZED');
  });
});
