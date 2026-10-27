import { InquiryStatus, NotificationStatus, Prisma } from '@prisma/client';
import { prisma } from '@/server/repositories/db';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { inquirySchema, InquiryInput } from '../../lib/validation/inquiry';
import { contactRateLimiter, ContactRateLimiter } from '../../lib/rate-limit';
import { getEmailTransport, EmailTransport } from '../../lib/email';

export class InquiryService {
  constructor(
    private rateLimiter: ContactRateLimiter = contactRateLimiter,
    private emailTransport: EmailTransport = getEmailTransport()
  ) {}

  async submitInquiry(input: InquiryInput, clientIp: string) {
    // 1. Validate
    const data = inquirySchema.parse(input);

    // 2. Honeypot check
    if (data.honeypot && data.honeypot.length > 0) {
      // Act like it succeeded to fool bots
      return { success: true };
    }

    // 3. Rate limiting
    const rlResult = await this.rateLimiter.check(clientIp, data.email);
    if (!rlResult.allowed) {
      // Return 429 semantic equivalent
      throw new Error(`RATE_LIMIT: ${rlResult.reason}`);
    }

    // 4. Store FIRST (fail-safe)
    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        organization: data.organization || null,
        projectType: data.projectType || null,
        message: data.message,
        source: data.source || null,
        status: InquiryStatus.NEW,
        notificationStatus: NotificationStatus.PENDING,
      }
    });

    // 4.5 Record in-app notification
    await createNotification({
      type: 'NEW_INQUIRY',
      entityId: inquiry.id,
      message: `New inquiry from ${data.name}`
    });

    // 5. Notify owner
    const emailTo = process.env.EMAIL_OWNER_TO;
    if (!emailTo) {
      // Missing config, record SKIPPED
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { notificationStatus: NotificationStatus.SKIPPED, notificationError: 'No destination email configured' }
      });
      return { success: true, inquiryId: inquiry.id };
    }

    const subject = `New Inquiry from ${data.name}`;
    const text = `Name: ${data.name}\nEmail: ${data.email}\nOrganization: ${data.organization || 'N/A'}\nProject Type: ${data.projectType || 'N/A'}\nSource: ${data.source || 'N/A'}\n\nMessage:\n${data.message}`;

    const [emailSetting, ackSetting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: 'publicContactEmail' } }),
      prisma.siteSetting.findUnique({ where: { key: 'sendVisitorAcknowledgement' } })
    ]);

    const notifyResult = await this.emailTransport.send({
      to: emailTo,
      subject,
      text,
      replyTo: data.email
    });

    let ackStatus: NotificationStatus | null = null;

    if (ackSetting && (ackSetting.value === 'true' || ackSetting.value === true)) {
      const fromEmail = emailSetting?.value ? String(emailSetting.value).replace(/"/g, '') : 'contact@example.com';
      const ackRes = await this.emailTransport.send({
        to: data.email,
        subject: 'Thank you for your inquiry',
        text: 'We have received your inquiry and will get back to you shortly.\n\n- The Gurmesa Team',
        replyTo: fromEmail
      });
      ackStatus = ackRes.status;
    }

    // 6. Record result
    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: {
        notificationStatus: notifyResult.status,
        notificationAttemptedAt: new Date(),
        notificationError: notifyResult.error ? notifyResult.error.substring(0, 255) : null,
        acknowledgementStatus: ackStatus
      }
    });

    return { success: true, inquiryId: inquiry.id };
  }

  // Admin Functions
  private async requireAuth() {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error('UNAUTHORIZED');
    }
    return session.user;
  }

  async listInquiries(params: { status?: InquiryStatus; search?: string; page?: number; limit?: number }) {
    await this.requireAuth();

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InquiryWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.inquiry.count({ where })
    ]);

    return { items, total, page, limit };
  }

  async getInquiry(id: string) {
    await this.requireAuth();
    return prisma.inquiry.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { name: true, email: true } } }
        }
      }
    });
  }

  async updateStatus(id: string, status: InquiryStatus) {
    await this.requireAuth();
    const result = await prisma.inquiry.update({
      where: { id },
      data: { status }
    });
  await logAdminAction({ action: 'UPDATE', entity: 'Inquiry', entityId: result?.id || 'unknown' });
  return result;
  }

  async addNote(id: string, body: string) {
    const user = await this.requireAuth();
    if (!user.id) throw new Error('UNAUTHORIZED: No user ID in session');

    const result = await prisma.inquiryNote.create({
      data: {
        inquiryId: id,
        authorId: user.id,
        body
      }
    });
  await logAdminAction({ action: 'CREATE', entity: 'Inquiry', entityId: result?.id || 'unknown' });
  return result;
  }

  async deleteInquiry(id: string) {
    await this.requireAuth();
    // Prisma cascading or manual? We need to delete notes first if no cascade.
    // Assuming schema has onDelete: Cascade for notes, but let's be safe.
    await prisma.inquiryNote.deleteMany({ where: { inquiryId: id } });
    const result = await prisma.inquiry.delete({
      where: { id }
    });
  await logAdminAction({ action: 'DELETE', entity: 'Inquiry', entityId: result?.id || 'unknown' });
  return result;
  }
}

export const inquiryService = new InquiryService();
