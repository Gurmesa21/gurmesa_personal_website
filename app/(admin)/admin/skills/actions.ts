'use server';
import { createSkill, updateSkill, deleteSkill } from '@/server/services/profileService';
import { skillRepository } from '@/server/repositories/skillRepository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export async function createAction(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const proficiencyLabel = formData.get('proficiencyLabel') as string;
  const items = await skillRepository.findMany();
  const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;
  
  await createSkill({ name, category, proficiencyLabel, order: maxOrder + 1 } as any);
  revalidatePath('/admin/skills');
  revalidatePath('/about');
  redirect('/admin/skills');
}

export async function updateAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const proficiencyLabel = formData.get('proficiencyLabel') as string;
  await updateSkill(id, { name, category, proficiencyLabel } as any);
  revalidatePath('/admin/skills');
  revalidatePath('/about');
  redirect('/admin/skills');
}

export async function deleteAction(id: string) {
  await deleteSkill(id);
  revalidatePath('/admin/skills');
  revalidatePath('/about');
}

export async function moveAction(id: string, newOrder: number) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const items = await skillRepository.findMany({ orderBy: { order: 'asc' } });
  const item = items.find(i => i.id === id);
  if (!item) return;

  const oldOrder = item.order;
  if (oldOrder === newOrder) return;

  if (newOrder < oldOrder) {
    for (const i of items) {
      if (i.order >= newOrder && i.order < oldOrder) {
        await skillRepository.update({ where: { id: i.id }, data: { order: i.order + 1 } });
      }
    }
  } else {
    for (const i of items) {
      if (i.order > oldOrder && i.order <= newOrder) {
        await skillRepository.update({ where: { id: i.id }, data: { order: i.order - 1 } });
      }
    }
  }
  await skillRepository.update({ where: { id }, data: { order: newOrder } });
  
  revalidatePath('/admin/skills');
  revalidatePath('/about');
}
