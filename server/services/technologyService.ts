import { prisma } from '../repositories/db';
import { Technology } from '@prisma/client';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
}

export async function getAdminTechnologies(): Promise<Technology[]> {
  await requireAdmin();
  return prisma.technology.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getAdminTechnologyById(id: string): Promise<Technology | null> {
  await requireAdmin();
  return prisma.technology.findUnique({
    where: { id }
  });
}

export async function createTechnology(data: { name: string; category: string; slug: string }): Promise<Technology> {
  await requireAdmin();
  const result = await prisma.technology.create({ data });
  await logAdminAction({ action: 'CREATE', entity: 'Technology', entityId: result?.id || 'unknown' });
  return result;
}

export async function updateTechnology(id: string, data: { name: string; category: string; slug: string }): Promise<Technology> {
  await requireAdmin();
  const result = await prisma.technology.update({
    where: { id },
    data
  });
  await logAdminAction({ action: 'UPDATE', entity: 'Technology', entityId: result?.id || 'unknown' });
  return result;
}

export async function deleteTechnology(id: string): Promise<Technology> {
  await requireAdmin();
  const result = await prisma.technology.delete({
    where: { id }
  });
  await logAdminAction({ action: 'DELETE', entity: 'Technology', entityId: result?.id || 'unknown' });
  return result;
}
