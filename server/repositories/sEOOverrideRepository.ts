import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const sEOOverrideRepository = {
  findMany: async (args?: Prisma.SEOOverrideFindManyArgs) => prisma.sEOOverride.findMany(args),
  findUnique: async (args: Prisma.SEOOverrideFindUniqueArgs) => prisma.sEOOverride.findUnique(args),
  create: async (args: Prisma.SEOOverrideCreateArgs) => prisma.sEOOverride.create(args),
  update: async (args: Prisma.SEOOverrideUpdateArgs) => prisma.sEOOverride.update(args),
  delete: async (args: Prisma.SEOOverrideDeleteArgs) => prisma.sEOOverride.delete(args),
};
