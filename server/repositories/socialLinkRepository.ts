import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const socialLinkRepository = {
  findMany: async (args?: Prisma.SocialLinkFindManyArgs) => prisma.socialLink.findMany(args),
  findUnique: async (args: Prisma.SocialLinkFindUniqueArgs) => prisma.socialLink.findUnique(args),
  create: async (args: Prisma.SocialLinkCreateArgs) => prisma.socialLink.create(args),
  update: async (args: Prisma.SocialLinkUpdateArgs) => prisma.socialLink.update(args),
  delete: async (args: Prisma.SocialLinkDeleteArgs) => prisma.socialLink.delete(args),
};
