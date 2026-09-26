import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const sessionRepository = {
  findMany: async (args?: Prisma.SessionFindManyArgs) => prisma.session.findMany(args),
  findUnique: async (args: Prisma.SessionFindUniqueArgs) => prisma.session.findUnique(args),
  create: async (args: Prisma.SessionCreateArgs) => prisma.session.create(args),
  update: async (args: Prisma.SessionUpdateArgs) => prisma.session.update(args),
  delete: async (args: Prisma.SessionDeleteArgs) => prisma.session.delete(args),
};
