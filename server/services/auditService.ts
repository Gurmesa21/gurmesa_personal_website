import { prisma } from '../repositories/db';
import { auth } from '../../auth';

export interface GetAuditLogsParams {
  page?: number;
  pageSize?: number;
  action?: string;
  entity?: string;
  search?: string;
}

export async function getAuditLogs(params?: GetAuditLogsParams) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const page = Math.max(1, Number(params?.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(params?.pageSize) || 20));
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (params?.action && params.action !== 'ALL') {
    where.action = params.action;
  }

  if (params?.entity && params.entity !== 'ALL') {
    where.entity = params.entity;
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { action: { contains: q, mode: 'insensitive' } },
      { entity: { contains: q, mode: 'insensitive' } },
      { entityId: { contains: q, mode: 'insensitive' } },
      { actor: { name: { contains: q, mode: 'insensitive' } } },
      { actor: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: pageSize,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAuditLogFilters() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const [actions, entities] = await Promise.all([
    prisma.auditLog.findMany({
      select: { action: true },
      distinct: ['action'],
    }),
    prisma.auditLog.findMany({
      select: { entity: true },
      distinct: ['entity'],
    }),
  ]);

  return {
    actions: actions.map((a) => a.action).filter(Boolean).sort(),
    entities: entities.map((e) => e.entity).filter(Boolean).sort(),
  };
}
