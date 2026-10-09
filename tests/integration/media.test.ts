import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { getAdminMedia, uploadMedia, deleteMedia } from '../../server/services/mediaService';
import { auth } from '../../auth';

const prisma = new PrismaClient();

vi.mock('next/server', () => ({}));

vi.mock('../../auth', () => ({
  auth: vi.fn()
}));

vi.mock('../../lib/storage', () => ({
  getStorageAdapter: vi.fn(() => ({
    upload: vi.fn(async (file, prefix) => ({
      key: `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}`,
      size: file.size,
      mimeType: file.type || 'application/octet-stream'
    })),
    delete: vi.fn(),
    getUrl: vi.fn(key => `https://storage.com/${key}`)
  }))
}));

describe('Media Service', () => {
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

  it('1. Unauthenticated media upload rejected', async () => {
    (auth as any).mockResolvedValue(null);
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    await expect(uploadMedia(file)).rejects.toThrow('Unauthorized');
  });

  it('2. Unauthenticated media delete rejected', async () => {
    (auth as any).mockResolvedValue(null);
    await expect(deleteMedia('some-id')).rejects.toThrow('Unauthorized');
  });

  it('3. Unauthenticated media list (admin) access rejected', async () => {
    (auth as any).mockResolvedValue(null);
    await expect(getAdminMedia()).rejects.toThrow('Unauthorized');
  });

  it('4. Malformed/disguised file upload rejected', async () => {
    // e.g. an executable's magic bytes with a .jpg extension
    // MZ (0x4D 0x5A) header
    const fakeExeContent = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const file = new File([fakeExeContent], 'not-an-exe.jpg', { type: 'image/jpeg' });
    await expect(uploadMedia(file)).rejects.toThrow(/Invalid/i);
  });

  it('5. Oversized file upload rejected', async () => {
    // Over 25MB limit
    const hugeContent = new Uint8Array(26 * 1024 * 1024);
    const file = new File([hugeContent], 'huge.jpg', { type: 'image/jpeg' });
    await expect(uploadMedia(file)).rejects.toThrow(/size/i);
  });

  it('6. Storage key is not derived from the original filename', async () => {
    // Mock the actual storage adapter instead of overriding the mock, wait we should just call uploadMedia
    const pdfMagicBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const file = new File([pdfMagicBytes], 'my-resume.pdf', { type: 'application/pdf' });
    const media = await uploadMedia(file);
    
    expect(media.storageKey).not.toContain('my-resume');
    expect(media.storageKey).not.toContain('my-resume.pdf');
    expect(media.storageKey).toMatch(/^media\//); // verify prefix

    await prisma.mediaAsset.delete({ where: { id: media.id } });
  });

  it('7. Deleting a MediaAsset that is referenced elsewhere behaves per whatever behavior you actually implemented', async () => {
    const jpgMagicBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const file = new File([jpgMagicBytes], 'test.jpg', { type: 'image/jpeg' });
    const media = await uploadMedia(file);
    
    // Reference it in SEO override
    const seo = await prisma.sEOOverride.create({
      data: {
        routeOrContentId: '/test-media-path',
        title: 'Test',
        ogImageId: media.id
      }
    });

    await expect(deleteMedia(media.id)).rejects.toThrow('Cannot delete media that is currently in use.');

    // cleanup
    await prisma.sEOOverride.delete({ where: { id: seo.id } });
    await prisma.mediaAsset.delete({ where: { id: media.id } });
    await prisma.auditLog.deleteMany({ where: { entityId: media.id } });
  });

});
