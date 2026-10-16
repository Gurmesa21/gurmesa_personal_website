import { prisma } from '@/server/repositories/db';
import { NotificationType } from '@prisma/client';

export async function createNotification({
  type,
  entityId,
  message
}: {
  type: NotificationType;
  entityId: string;
  message: string;
}) {
  await prisma.notification.create({
    data: {
      type,
      entityId,
      message,
    }
  });
}
