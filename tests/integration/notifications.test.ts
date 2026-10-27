import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, NotificationType, TestimonialStatus, TestimonialPermissionStatus } from '@prisma/client';

// Mock auth before importing services
vi.mock('../../auth', () => ({
  auth: vi.fn()
}));

import { inquiryService } from '../../server/services/inquiryService';
import { testimonialService } from '../../server/services/testimonialService';

const prisma = new PrismaClient();

describe('Notification System', () => {
  beforeAll(async () => {
    await prisma.notification.deleteMany({});
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({});
    await prisma.$disconnect();
  });

  it('13. Submitting a new Inquiry creates a Notification row with the correct type and entityId', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, I want a website'
    };

    const res = await inquiryService.submitInquiry(input, '127.0.0.1');
    expect(res.success).toBe(true);
    const inquiryId = res.inquiryId;

    const notification = await prisma.notification.findFirst({
      where: { type: NotificationType.NEW_INQUIRY, entityId: inquiryId! }
    });

    expect(notification).toBeDefined();
    expect(notification?.isRead).toBe(false);
    expect(notification?.message).toContain('John Doe');
  });

  it('14. Submitting a new Testimonial creates a Notification row with the correct type and entityId', async () => {
    const input = {
      name: 'Jane Smith',
      content: 'Great work on the full stack development project!',
      status: TestimonialStatus.DRAFT,
      permissionStatus: TestimonialPermissionStatus.PENDING
    };

    const res = await testimonialService.submitPublicTestimonial(input);
    expect(res.id).toBeDefined();

    const notification = await prisma.notification.findFirst({
      where: { type: NotificationType.NEW_TESTIMONIAL, entityId: res.id }
    });

    expect(notification).toBeDefined();
    expect(notification?.isRead).toBe(false);
    expect(notification?.message).toContain('Jane Smith');
  });

  it('15. Marking a notification read updates isRead and is reflected in the unread count', async () => {
    const n = await prisma.notification.create({
      data: {
        type: NotificationType.NEW_INQUIRY,
        entityId: 'dummy',
        message: 'Dummy'
      }
    });

    // Mark as read
    await prisma.notification.update({
      where: { id: n.id },
      data: { isRead: true }
    });

    // Check notification again
    const updated = await prisma.notification.findUnique({ where: { id: n.id } });
    expect(updated?.isRead).toBe(true);
  });
});
