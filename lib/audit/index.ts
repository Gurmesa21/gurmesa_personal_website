import { prisma } from '@/server/repositories/db';
import { auth } from '@/auth';

export async function logAdminAction({
  action,
  entity,
  entityId,
  actorId: explicitActorId,
  metadata
}: {
  action: string;
  entity: string;
  entityId?: string;
  actorId?: string;
  metadata?: any;
}) {
  const session = await auth();
  const actorId = explicitActorId || session?.user?.id;

  // We should log even if unauthenticated/system actions happen, but with a missing actorId
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      actorId,
      metadata: metadata ? (metadata as any) : undefined,
      timestamp: new Date()
    }
  });
}
