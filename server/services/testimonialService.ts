import { PrismaClient, TestimonialStatus, TestimonialPermissionStatus, Prisma } from '@prisma/client';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

const prisma = new PrismaClient();

export class TestimonialService {
  private async requireAuth() {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('UNAUTHORIZED');
    }
    return session.user;
  }

  // PUBLIC
  async getPublicTestimonials() {
    return prisma.testimonial.findMany({
      where: {
        status: TestimonialStatus.PUBLISHED,
        permissionStatus: TestimonialPermissionStatus.AUTHORIZED
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async submitPublicTestimonial(data: Prisma.TestimonialCreateInput) {
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
}

export const testimonialService = new TestimonialService();
