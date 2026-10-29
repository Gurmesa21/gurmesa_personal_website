import { TestimonialStatus, TestimonialPermissionStatus, Prisma } from '@prisma/client';
import { prisma } from '@/server/repositories/db';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { getEmailTransport, EmailTransport } from '@/lib/email';

export class TestimonialService {
  constructor(
    private emailTransport: EmailTransport = getEmailTransport()
  ) {}

  private async requireAuth() {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('UNAUTHORIZED');
    }
    return session.user;
  }

  // PUBLIC
  async getPublicTestimonials(options?: { limit?: number; orderBy?: 'createdAt' | 'featured' }) {
    const orderBy = options?.orderBy === 'createdAt'
      ? [{ createdAt: 'desc' as const }]
      : [{ featured: 'desc' as const }, { createdAt: 'desc' as const }];

    return prisma.testimonial.findMany({
      where: {
        status: TestimonialStatus.PUBLISHED,
        permissionStatus: TestimonialPermissionStatus.AUTHORIZED
      },
      orderBy,
      take: options?.limit
    });
  }

  async submitPublicTestimonial(data: Prisma.TestimonialCreateInput) {
    const trimmed = (data.content || '').trim();
    if (trimmed.length < 20) {
      throw new Error('Testimonial text must be at least 20 characters.');
    }
    if (trimmed.length > 200) {
      throw new Error('Testimonial text must not exceed 200 characters.');
    }
    // Force safe default statuses for public submissions
    const safeData = {
      ...data,
      status: TestimonialStatus.DRAFT,
      permissionStatus: TestimonialPermissionStatus.PENDING,
    };
    const testimonial = await prisma.testimonial.create({ data: safeData });
    
    await createNotification({
      type: 'NEW_TESTIMONIAL',
      entityId: testimonial.id,
      message: `New testimonial submitted by ${data.name}`
    });

    const emailTo = process.env.EMAIL_OWNER_TO;
    if (emailTo) {
      await this.emailTransport.send({
        to: emailTo,
        subject: `New Testimonial Submission from ${data.name}`,
        text: `New testimonial submitted:\nName: ${data.name}\nRole: ${data.role || 'N/A'}\nOrganization: ${data.organization || 'N/A'}\n\nContent:\n${trimmed}`,
        replyTo: (data as any).email || undefined
      });
    }

    return testimonial;
  }

  // ADMIN
  async listAdminTestimonials() {
    await this.requireAuth();
    return prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAdminTestimonial(id: string) {
    await this.requireAuth();
    return prisma.testimonial.findUnique({ where: { id } });
  }

  async createTestimonial(data: Prisma.TestimonialCreateInput) {
    await this.requireAuth();
    const result = await prisma.testimonial.create({ data });
  await logAdminAction({ action: 'CREATE', entity: 'Testimonial', entityId: result?.id || 'unknown' });
  return result;
  }

  async updateTestimonial(id: string, data: Prisma.TestimonialUpdateInput) {
    await this.requireAuth();
    const result = await prisma.testimonial.update({
      where: { id },
      data
    });
  await logAdminAction({ action: 'UPDATE', entity: 'Testimonial', entityId: result?.id || 'unknown' });
  return result;
  }

  async deleteTestimonial(id: string) {
    await this.requireAuth();
    const result = await prisma.testimonial.delete({ where: { id } });
  await logAdminAction({ action: 'DELETE', entity: 'Testimonial', entityId: result?.id || 'unknown' });
  return result;
  }

  async approveTestimonial(id: string) {
    await this.requireAuth();
    const updateResult = await prisma.testimonial.updateMany({
      where: {
        id,
        OR: [
          { status: { not: TestimonialStatus.PUBLISHED } },
          { permissionStatus: { not: TestimonialPermissionStatus.AUTHORIZED } }
        ]
      },
      data: {
        status: TestimonialStatus.PUBLISHED,
        permissionStatus: TestimonialPermissionStatus.AUTHORIZED
      }
    });

    const item = await prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new Error('Testimonial not found');

    if (updateResult.count > 0) {
      await logAdminAction({ action: 'APPROVE', entity: 'Testimonial', entityId: id });
    }
    return item;
  }
}

export const testimonialService = new TestimonialService();
