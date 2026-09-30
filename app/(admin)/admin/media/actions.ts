'use server';

import { uploadMedia, deleteMedia } from '@/server/services/mediaService';
import { updateSiteSetting } from '@/server/services/siteSettingService';
import { revalidatePath } from 'next/cache';

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get('file') as File;
  const altText = formData.get('altText') as string;
  if (!file) throw new Error('File required');
  await uploadMedia(file, altText);
  revalidatePath('/admin/media');
}

export async function deleteMediaAction(formData: FormData) {
  const id = formData.get('id') as string;
  await deleteMedia(id);
  revalidatePath('/admin/media');
}

export async function setAsResumeAction(formData: FormData) {
  const id = formData.get('id') as string;
  await updateSiteSetting('resumeMediaId', id);
  revalidatePath('/admin/media');
  revalidatePath('/about');
}
