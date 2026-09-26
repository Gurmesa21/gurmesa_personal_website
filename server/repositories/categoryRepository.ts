import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const categoryRepository = {
  findMany: async (args?: Prisma.CategoryFindManyArgs) => prisma.category.findMany(args),
  findUnique: async (args: Prisma.CategoryFindUniqueArgs) => prisma.category.findUnique(args),
  create: async (args: Prisma.CategoryCreateArgs) => prisma.category.create(args),
  update: async (args: Prisma.CategoryUpdateArgs) => prisma.category.update(args),
  delete: async (args: Prisma.CategoryDeleteArgs) => prisma.category.delete(args),
};
