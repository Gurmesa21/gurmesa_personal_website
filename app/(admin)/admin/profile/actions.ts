'use server';
import { updateProfile } from '@/server/services/profileService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfileAction(formData: FormData) {
  const name = formData.get('name') as string;
  const title = formData.get('title') as string;
  const tagline = formData.get('tagline') as string;
  const bio = formData.get('bio') as string;
  const locationLabel = formData.get('locationLabel') as string;
  const availabilityStatus = formData.get('availabilityStatus') as string;
  const avatarId = formData.get('avatarId') as string;
  console.log('----- updateProfileAction received avatarId:', avatarId, '-----');

  await updateProfile({
    name,
    title,
    tagline,
    bio,
    locationLabel: locationLabel || null,
    availabilityStatus: availabilityStatus || null,
    avatarId: avatarId || null,
  });

  revalidatePath('/', 'layout');
  redirect('/admin/profile');
}
