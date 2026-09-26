import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const projectMediaRepository = {
  findMany: async (args?: Prisma.ProjectMediaFindManyArgs) => prisma.projectMedia.findMany(args),
  findUnique: async (args: Prisma.ProjectMediaFindUniqueArgs) => prisma.projectMedia.findUnique(args),
  create: async (args: Prisma.ProjectMediaCreateArgs) => prisma.projectMedia.create(args),
  update: async (args: Prisma.ProjectMediaUpdateArgs) => prisma.projectMedia.update(args),
  delete: async (args: Prisma.ProjectMediaDeleteArgs) => prisma.projectMedia.delete(args),
};
