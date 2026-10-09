import { prisma } from '../repositories/db';
import { getStorageAdapter } from '@/lib/storage';
import { validateMediaUpload } from '@/lib/storage/validation';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';

export async function getAdminMedia() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  
  return prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { projectMedia: true, featuredPosts: true, seoOverrides: true }
      }
    }
  });
}

export async function uploadMedia(file: File, altText?: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const detectedMimeType = await validateMediaUpload(file);
  
  const storage = getStorageAdapter();
  const { key, size, mimeType: _ } = await storage.upload(file, 'media/');
  
  const media = await prisma.mediaAsset.create({
    data: {
      storageKey: key,
      size,
      mimeType: detectedMimeType,
      altText: altText || null
    }
  });

  await logAdminAction({ action: 'CREATE', entity: 'MediaAsset', entityId: media.id });
  return media;
}

export async function updateMediaAltText(id: string, altText: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const media = await prisma.mediaAsset.update({
    where: { id },
    data: { altText }
  });

  await logAdminAction({ action: 'UPDATE', entity: 'MediaAsset', entityId: media.id });
  return media;
}

export async function deleteMedia(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: {
      _count: {
        select: { projectMedia: true, featuredPosts: true, seoOverrides: true }
      }
    }
  });

  if (!asset) throw new Error('Media not found');

  if (asset._count.projectMedia > 0 || asset._count.featuredPosts > 0 || asset._count.seoOverrides > 0) {
    throw new Error('Cannot delete media that is currently in use.');
  }

  const storage = getStorageAdapter();
  await storage.delete(asset.storageKey);

  const deleted = await prisma.mediaAsset.delete({ where: { id } });

  await logAdminAction({ action: 'DELETE', entity: 'MediaAsset', entityId: id });
  return deleted;
}

export async function getResumeUrl() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'resumeMediaId' } });
  if (!setting || typeof setting.value !== 'string') return null;

  const media = await prisma.mediaAsset.findUnique({ where: { id: setting.value } });
  if (!media) return null;

  const storage = getStorageAdapter();
  return storage.getUrl(media.storageKey);
}
