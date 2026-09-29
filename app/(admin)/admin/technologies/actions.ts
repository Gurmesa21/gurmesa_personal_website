'use server';

import { revalidatePath } from 'next/cache';
import { createTechnology, updateTechnology, deleteTechnology } from '@/server/services/technologyService';
import { redirect } from 'next/navigation';

export async function createTechnologyAction(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const slug = formData.get('slug') as string;

  await createTechnology({
    name,
    category,
    slug
  });

  revalidatePath('/admin/technologies');
  revalidatePath('/work');
  redirect('/admin/technologies');
}

export async function updateTechnologyAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const slug = formData.get('slug') as string;

  await updateTechnology(id, {
    name,
    category,
    slug
  });

  revalidatePath('/admin/technologies');
  revalidatePath('/work');
  redirect('/admin/technologies');
}

export async function deleteTechnologyAction(id: string) {
  await deleteTechnology(id);
  revalidatePath('/admin/technologies');
  revalidatePath('/work');
}
