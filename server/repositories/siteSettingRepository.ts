import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const siteSettingRepository = {
  findMany: async (args?: Prisma.SiteSettingFindManyArgs) => prisma.siteSetting.findMany(args),
  findUnique: async (args: Prisma.SiteSettingFindUniqueArgs) => prisma.siteSetting.findUnique(args),
  create: async (args: Prisma.SiteSettingCreateArgs) => prisma.siteSetting.create(args),
  update: async (args: Prisma.SiteSettingUpdateArgs) => prisma.siteSetting.update(args),
  delete: async (args: Prisma.SiteSettingDeleteArgs) => prisma.siteSetting.delete(args),
};
