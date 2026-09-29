import { prisma } from '../repositories/db';
import { Technology } from '@prisma/client';
import { auth } from '../../auth';

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
  return prisma.technology.create({ data });
}

export async function updateTechnology(id: string, data: { name: string; category: string; slug: string }): Promise<Technology> {
  await requireAdmin();
  return prisma.technology.update({
    where: { id },
    data
  });
}

export async function deleteTechnology(id: string): Promise<Technology> {
  await requireAdmin();
  return prisma.technology.delete({
    where: { id }
  });
}
