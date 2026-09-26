import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const serviceRepository = {
  findMany: async (args?: Prisma.ServiceFindManyArgs) => prisma.service.findMany(args),
  findUnique: async (args: Prisma.ServiceFindUniqueArgs) => prisma.service.findUnique(args),
  create: async (args: Prisma.ServiceCreateArgs) => prisma.service.create(args),
  update: async (args: Prisma.ServiceUpdateArgs) => prisma.service.update(args),
  delete: async (args: Prisma.ServiceDeleteArgs) => prisma.service.delete(args),
};
