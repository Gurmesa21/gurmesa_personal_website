import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { testimonialService } from '../../server/services/testimonialService';
import { updateSiteSetting } from '../../server/services/siteSettingService';
import { deleteMedia, uploadMedia } from '../../server/services/mediaService';
import { auth } from '../../auth';
// For LOGIN, we can invoke the authorize function from our NextAuth config.
// Since NextAuth is a function returning an object in our file, we might need to test it differently, or just test getAuditLogs directly if we mock prisma.

const prisma = new PrismaClient();

vi.mock('next/server', () => ({}));

vi.mock('../../auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn()
}));

// We need to mock storage for media
vi.mock('../../lib/storage', () => ({
  getStorageAdapter: vi.fn(() => ({
    upload: vi.fn(async () => ({ key: 'test', size: 10, mimeType: 'image/jpeg' })),
    delete: vi.fn(),
    getUrl: vi.fn(() => 'url')
  }))
}));

describe('Audit Logs', () => {
  let mockUser: any;
  let adminId: string;

  beforeEach(async () => {
    // Create a real user in DB so FK constraints pass
    const user = await prisma.adminUser.create({
      data: {
        name: 'Admin Test',
        email: `admin-${Date.now()}@test.com`,
        status: 'ACTIVE'
      }
    });
    adminId = user.id;

    mockUser = { user: { id: adminId, email: user.email } };
    (auth as any).mockResolvedValue(mockUser);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.auditLog.deleteMany({ where: { actorId: adminId } });
    await prisma.adminUser.delete({ where: { id: adminId } });
  });

  it('9a. Audit log entry is created for a publish action', async () => {
    // We will create a testimonial, then update it
    const t = await prisma.testimonial.create({
      data: { name: 'Audit Test', content: 'C', status: 'DRAFT', permissionStatus: 'AUTHORIZED' }
    });
    
    await testimonialService.updateTestimonial(t.id, { status: 'PUBLISHED' });
    
    const logs = await prisma.auditLog.findMany({
      where: { entity: 'Testimonial', entityId: t.id, action: 'UPDATE' }
    });
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].actorId).toBe(adminId);
    expect(logs[0].metadata).toBeDefined();

    // cleanup
    await prisma.auditLog.deleteMany({ where: { entityId: t.id } });
    await prisma.testimonial.delete({ where: { id: t.id } });
  });

  it('9b. Audit log entry is created for a settings change', async () => {
    await updateSiteSetting('inquiryRetentionDays', 90);
    
    const logs = await prisma.auditLog.findMany({
      where: { entity: 'SiteSetting', entityId: 'inquiryRetentionDays', action: 'UPDATE' },
      orderBy: { timestamp: 'desc' }
    });
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].actorId).toBe(adminId);
    expect((logs[0].metadata as any).value).toBe(90);

    // cleanup
    await prisma.auditLog.deleteMany({ where: { entity: 'SiteSetting', entityId: 'inquiryRetentionDays' } });
  });


  it('9d. Audit log entry is created for a media delete', async () => {
    const jpgMagicBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const file = new File([jpgMagicBytes], 'test.jpg', { type: 'image/jpeg' });
    const media = await uploadMedia(file);
    
    await deleteMedia(media.id);
    
    const logs = await prisma.auditLog.findMany({
      where: { entity: 'MediaAsset', entityId: media.id, action: 'DELETE' }
    });
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].actorId).toBe(adminId);

    // cleanup
    await prisma.auditLog.deleteMany({ where: { entityId: media.id } });
  });

  it('10. Unauthenticated audit log viewer access rejected', async () => {
    (auth as any).mockResolvedValue(null);
    const { getAuditLogs } = await import('../../server/services/auditService');
    await expect(getAuditLogs()).rejects.toThrow('Unauthorized');
  });
});
