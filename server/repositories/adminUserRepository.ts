import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const adminUserRepository = {
  findMany: async (args?: Prisma.AdminUserFindManyArgs) => prisma.adminUser.findMany(args),
  findUnique: async (args: Prisma.AdminUserFindUniqueArgs) => prisma.adminUser.findUnique(args),
  create: async (args: Prisma.AdminUserCreateArgs) => prisma.adminUser.create(args),
  update: async (args: Prisma.AdminUserUpdateArgs) => prisma.adminUser.update(args),
  delete: async (args: Prisma.AdminUserDeleteArgs) => prisma.adminUser.delete(args),
};
