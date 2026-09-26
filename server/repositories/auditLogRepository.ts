import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const auditLogRepository = {
  findMany: async (args?: Prisma.AuditLogFindManyArgs) => prisma.auditLog.findMany(args),
  findUnique: async (args: Prisma.AuditLogFindUniqueArgs) => prisma.auditLog.findUnique(args),
  create: async (args: Prisma.AuditLogCreateArgs) => prisma.auditLog.create(args),
  update: async (args: Prisma.AuditLogUpdateArgs) => prisma.auditLog.update(args),
  delete: async (args: Prisma.AuditLogDeleteArgs) => prisma.auditLog.delete(args),
};
