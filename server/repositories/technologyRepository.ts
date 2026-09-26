import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const technologyRepository = {
  findMany: async (args?: Prisma.TechnologyFindManyArgs) => prisma.technology.findMany(args),
  findUnique: async (args: Prisma.TechnologyFindUniqueArgs) => prisma.technology.findUnique(args),
  create: async (args: Prisma.TechnologyCreateArgs) => prisma.technology.create(args),
  update: async (args: Prisma.TechnologyUpdateArgs) => prisma.technology.update(args),
  delete: async (args: Prisma.TechnologyDeleteArgs) => prisma.technology.delete(args),
};
