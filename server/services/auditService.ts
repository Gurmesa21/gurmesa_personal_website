import { prisma } from '../repositories/db';
import { auth } from '../../auth';

export async function getAuditLogs() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  
  return prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    include: {
      actor: { select: { name: true, email: true } }
    }
  });
}
