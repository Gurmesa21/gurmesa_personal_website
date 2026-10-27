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
        select: {
          projectMedia: true,
          featuredPosts: true,
          seoOverrides: true,
          services: true,
          profiles: true,
        }
      }
    }
  });
}

export async function uploadMedia(file: File, altText?: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  // 1. Validate the uploaded file
  const detectedMimeType = await validateMediaUpload(file);
  
  // 2. Upload the file to storage
  const storage = getStorageAdapter();
  const { key, size } = await storage.upload(file, 'media/');
  
  // 3. Create the database record with compensating cleanup on failure
  let media;
  try {
    media = await prisma.mediaAsset.create({
      data: {
        storageKey: key,
        size,
        mimeType: detectedMimeType,
        altText: altText || null
      }
    });
  } catch (dbError) {
    // 4. If database creation fails, attempt to delete the uploaded object
    try {
      await storage.delete(key);
    } catch (cleanupError) {
      console.error('[Storage Cleanup] Failed to delete orphaned object after DB error:', cleanupError);
    }
    // 5. Rethrow original database error without hiding it
    throw dbError;
  }

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
        select: {
          projectMedia: true,
          featuredPosts: true,
          seoOverrides: true,
          services: true,
          profiles: true,
        }
      }
    }
  });

  if (!asset) throw new Error('Media not found');

  if (
    asset._count.projectMedia > 0 ||
    asset._count.featuredPosts > 0 ||
    asset._count.seoOverrides > 0 ||
    asset._count.services > 0 ||
    asset._count.profiles > 0
  ) {
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
