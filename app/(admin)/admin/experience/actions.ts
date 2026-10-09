'use server';
import { createExperience, updateExperience, deleteExperience } from '@/server/services/profileService';
import { experienceRepository } from '@/server/repositories/experienceRepository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

function parseDateSafe(dateStr: string, fallback: Date | null = null): Date | null {
  if (!dateStr || !dateStr.trim()) return fallback;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? fallback : d;
}

export async function createAction(formData: FormData) {
  const organization = formData.get('organization') as string;
  const role = formData.get('role') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const startDate = parseDateSafe(startDateStr, new Date()) as Date;
  const endDate = parseDateSafe(endDateStr, null);
  const description = formData.get('description') as string;
  const items = await experienceRepository.findMany();
  const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;
  
  await createExperience({ organization, role, startDate, endDate, description, order: maxOrder + 1 } as any);
  revalidatePath('/admin/experience');
  revalidatePath('/about');
  redirect('/admin/experience');
}

export async function updateAction(id: string, formData: FormData) {
  const organization = formData.get('organization') as string;
  const role = formData.get('role') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const startDate = parseDateSafe(startDateStr, new Date()) as Date;
  const endDate = parseDateSafe(endDateStr, null);
  const description = formData.get('description') as string;
  await updateExperience(id, { organization, role, startDate, endDate, description } as any);
  revalidatePath('/admin/experience');
  revalidatePath('/about');
  redirect('/admin/experience');
}

export async function deleteAction(id: string) {
  await deleteExperience(id);
  revalidatePath('/admin/experience');
  revalidatePath('/about');
}

export async function moveAction(id: string, newOrder: number) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const items = await experienceRepository.findMany({ orderBy: { order: 'asc' } });
  const item = items.find(i => i.id === id);
  if (!item) return;

  const oldOrder = item.order;
  if (oldOrder === newOrder) return;

  if (newOrder < oldOrder) {
    for (const i of items) {
      if (i.order >= newOrder && i.order < oldOrder) {
        await experienceRepository.update({ where: { id: i.id }, data: { order: i.order + 1 } });
      }
    }
  } else {
    for (const i of items) {
      if (i.order > oldOrder && i.order <= newOrder) {
        await experienceRepository.update({ where: { id: i.id }, data: { order: i.order - 1 } });
      }
    }
  }
  await experienceRepository.update({ where: { id }, data: { order: newOrder } });
  
  revalidatePath('/admin/experience');
  revalidatePath('/about');
}
