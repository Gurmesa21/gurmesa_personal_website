import { InquiryStatus, BlogPostStatus } from '@prisma/client';
import { prisma } from '@/server/repositories/db';
import { auth } from '../../auth';

export class AdminOverviewService {
  async getCounts() {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('UNAUTHORIZED');
    }

    const [
      newInquiries,
      totalInquiries,
      draftPosts,
      publishedPosts,
      projects,
      services,
      testimonials
    ] = await Promise.all([
      prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
      prisma.inquiry.count(),
      prisma.blogPost.count({ where: { status: BlogPostStatus.DRAFT } }),
      prisma.blogPost.count({ where: { status: BlogPostStatus.PUBLISHED } }),
      prisma.project.count(),
      prisma.service.count(),
      prisma.testimonial.count()
    ]);

    return {
      newInquiries,
      totalInquiries,
      draftPosts,
      publishedPosts,
      projects,
      services,
      testimonials
    };
  }
}

export const adminOverviewService = new AdminOverviewService();
