import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const profileRepository = {
  findMany: async (args?: Prisma.ProfileFindManyArgs) => prisma.profile.findMany(args),
  findUnique: async (args: Prisma.ProfileFindUniqueArgs) => prisma.profile.findUnique(args),
  create: async (args: Prisma.ProfileCreateArgs) => prisma.profile.create(args),
  update: async (args: Prisma.ProfileUpdateArgs) => prisma.profile.update(args),
  delete: async (args: Prisma.ProfileDeleteArgs) => prisma.profile.delete(args),
};
