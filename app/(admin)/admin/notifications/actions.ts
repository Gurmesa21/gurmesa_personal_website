'use server';

import { prisma } from '@/server/repositories/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function markAsRead(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHORIZED');

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
  
  revalidatePath('/admin/notifications', 'layout');
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHORIZED');

  await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true }
  });
  
  revalidatePath('/admin/notifications', 'layout');
}
