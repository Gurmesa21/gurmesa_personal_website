'use server';
import { createSocialLink, updateSocialLink, deleteSocialLink } from '@/server/services/profileService';
import { socialLinkRepository } from '@/server/repositories/socialLinkRepository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export async function createAction(formData: FormData) {
  const platform = formData.get('platform') as string;
  const url = formData.get('url') as string;
  const label = formData.get('label') as string;
  const visibility = formData.get('visibility') as string;
  const items = await socialLinkRepository.findMany();
  const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;
  
  await createSocialLink({ platform, url, label, visibility, order: maxOrder + 1 } as any);
  revalidatePath('/admin/social-links');
  revalidatePath('/about');
  redirect('/admin/social-links');
}

export async function updateAction(id: string, formData: FormData) {
  const platform = formData.get('platform') as string;
  const url = formData.get('url') as string;
  const label = formData.get('label') as string;
  const visibility = formData.get('visibility') as string;
  await updateSocialLink(id, { platform, url, label, visibility } as any);
  revalidatePath('/admin/social-links');
  revalidatePath('/about');
  redirect('/admin/social-links');
}

export async function deleteAction(id: string) {
  await deleteSocialLink(id);
  revalidatePath('/admin/social-links');
  revalidatePath('/about');
}

export async function moveAction(id: string, newOrder: number) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const items = await socialLinkRepository.findMany({ orderBy: { order: 'asc' } });
  const item = items.find(i => i.id === id);
  if (!item) return;

  const oldOrder = item.order;
  if (oldOrder === newOrder) return;

  if (newOrder < oldOrder) {
    for (const i of items) {
      if (i.order >= newOrder && i.order < oldOrder) {
        await socialLinkRepository.update({ where: { id: i.id }, data: { order: i.order + 1 } });
      }
    }
  } else {
    for (const i of items) {
      if (i.order > oldOrder && i.order <= newOrder) {
        await socialLinkRepository.update({ where: { id: i.id }, data: { order: i.order - 1 } });
      }
    }
  }
  await socialLinkRepository.update({ where: { id }, data: { order: newOrder } });
  
  revalidatePath('/admin/social-links');
  revalidatePath('/about');
}
