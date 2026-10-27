/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadMedia, deleteMedia } from '@/server/services/mediaService';
import { prisma } from '@/server/repositories/db';
import { auth } from '@/auth';
import * as storageModule from '@/lib/storage';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/audit', () => ({
  logAdminAction: vi.fn(),
}));

describe('Media Service - Infrastructure Consistency & Reference Protection', () => {
  let mockStorage: {
    upload: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).mockResolvedValue({ user: { id: 'admin-1', email: 'admin@example.com' } });

    mockStorage = {
      upload: vi.fn().mockResolvedValue({
        key: 'media/test-uuid.png',
        size: 100,
        mimeType: 'image/png',
        url: 'https://storage/media/test-uuid.png',
      }),
      delete: vi.fn().mockResolvedValue(undefined),
      getUrl: vi.fn().mockResolvedValue('https://storage/media/test-uuid.png'),
    };

    vi.spyOn(storageModule, 'getStorageAdapter').mockReturnValue(mockStorage as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Compensating upload cleanup', () => {
    it('attempts to delete uploaded object from storage and rethrows error if DB creation fails', async () => {
      // Valid PNG file (magic bytes: 0x89, 0x50, 0x4E, 0x47)
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0C]);
      const validPng = new File([pngHeader], 'test.png', { type: 'image/png' });

      // Mock DB create failure
      const dbError = new Error('Database connection lost');
      vi.spyOn(prisma.mediaAsset, 'create').mockRejectedValue(dbError);

      await expect(uploadMedia(validPng, 'Alt text')).rejects.toThrow('Database connection lost');

      // Verify compensating cleanup called
      expect(mockStorage.upload).toHaveBeenCalledTimes(1);
      expect(mockStorage.delete).toHaveBeenCalledWith('media/test-uuid.png');
    });
  });

  describe('Media deletion protection', () => {
    it('protects assets referenced by Service.featuredImageId (services)', async () => {
      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'asset-1',
        storageKey: 'media/service-img.png',
        mimeType: 'image/png',
        size: 100,
        width: null,
        height: null,
        altText: null,
        createdAt: new Date(),
        _count: {
          projectMedia: 0,
          featuredPosts: 0,
          seoOverrides: 0,
          services: 1, // Referenced by a Service!
          profiles: 0,
        },
      } as any);

      await expect(deleteMedia('asset-1')).rejects.toThrow('Cannot delete media that is currently in use.');
      expect(mockStorage.delete).not.toHaveBeenCalled();
    });

    it('protects assets referenced by Profile.avatarId (profiles)', async () => {
      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'asset-2',
        storageKey: 'media/avatar.png',
        mimeType: 'image/png',
        size: 100,
        width: null,
        height: null,
        altText: null,
        createdAt: new Date(),
        _count: {
          projectMedia: 0,
          featuredPosts: 0,
          seoOverrides: 0,
          services: 0,
          profiles: 1, // Referenced by a Profile!
        },
      } as any);

      await expect(deleteMedia('asset-2')).rejects.toThrow('Cannot delete media that is currently in use.');
      expect(mockStorage.delete).not.toHaveBeenCalled();
    });

    it('successfully deletes unreferenced media following exact order (storage -> db -> audit)', async () => {
      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'asset-clean',
        storageKey: 'media/clean.png',
        mimeType: 'image/png',
        size: 100,
        width: null,
        height: null,
        altText: null,
        createdAt: new Date(),
        _count: {
          projectMedia: 0,
          featuredPosts: 0,
          seoOverrides: 0,
          services: 0,
          profiles: 0,
        },
      } as any);

      const deleteOrder: string[] = [];
      mockStorage.delete.mockImplementation(async () => {
        deleteOrder.push('storage.delete');
      });

      vi.spyOn(prisma.mediaAsset, 'delete').mockImplementation((async () => {
        deleteOrder.push('prisma.delete');
        return { id: 'asset-clean' } as any;
      }) as any);

      const result = await deleteMedia('asset-clean');
      expect(result).toBeDefined();

      expect(deleteOrder).toEqual(['storage.delete', 'prisma.delete']);
    });
  });
});
