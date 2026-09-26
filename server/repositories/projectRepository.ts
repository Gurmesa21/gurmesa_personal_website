import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const projectRepository = {
  findMany: async (args?: Prisma.ProjectFindManyArgs) => prisma.project.findMany(args),
  findUnique: async (args: Prisma.ProjectFindUniqueArgs) => prisma.project.findUnique(args),
  create: async (args: Prisma.ProjectCreateArgs) => prisma.project.create(args),
  update: async (args: Prisma.ProjectUpdateArgs) => prisma.project.update(args),
  delete: async (args: Prisma.ProjectDeleteArgs) => prisma.project.delete(args),
};
