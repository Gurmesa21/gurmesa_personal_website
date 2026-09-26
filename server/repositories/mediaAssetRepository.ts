import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const mediaAssetRepository = {
  findMany: async (args?: Prisma.MediaAssetFindManyArgs) => prisma.mediaAsset.findMany(args),
  findUnique: async (args: Prisma.MediaAssetFindUniqueArgs) => prisma.mediaAsset.findUnique(args),
  create: async (args: Prisma.MediaAssetCreateArgs) => prisma.mediaAsset.create(args),
  update: async (args: Prisma.MediaAssetUpdateArgs) => prisma.mediaAsset.update(args),
  delete: async (args: Prisma.MediaAssetDeleteArgs) => prisma.mediaAsset.delete(args),
};
