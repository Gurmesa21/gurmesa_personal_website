import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const tagRepository = {
  findMany: async (args?: Prisma.TagFindManyArgs) => prisma.tag.findMany(args),
  findUnique: async (args: Prisma.TagFindUniqueArgs) => prisma.tag.findUnique(args),
  create: async (args: Prisma.TagCreateArgs) => prisma.tag.create(args),
  update: async (args: Prisma.TagUpdateArgs) => prisma.tag.update(args),
  delete: async (args: Prisma.TagDeleteArgs) => prisma.tag.delete(args),
};
