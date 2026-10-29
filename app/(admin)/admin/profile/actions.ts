'use server';
import { updateProfile } from '@/server/services/profileService';
import { updateSiteSetting } from '@/server/services/siteSettingService';
import { revalidatePath } from 'next/cache';
import { revalidatePublicContent } from '@/lib/revalidate';
import { redirect } from 'next/navigation';

export async function updateProfileAction(formData: FormData) {
  const name = formData.get('name') as string;
  const title = formData.get('title') as string;
  const tagline = formData.get('tagline') as string;
  const bio = formData.get('bio') as string;
  const locationLabel = formData.get('locationLabel') as string;
  const availabilityStatus = formData.get('availabilityStatus') as string;
  const avatarId = formData.get('avatarId') as string;
  const publicContactEmail = formData.get('publicContactEmail') as string | null;

  await updateProfile({
    name,
    title,
    tagline,
    bio,
    locationLabel: locationLabel || null,
    availabilityStatus: availabilityStatus || null,
    avatarId: avatarId || null,
  });

  if (publicContactEmail !== null && publicContactEmail !== undefined) {
    const trimmed = publicContactEmail.trim();
    if (trimmed) {
      // Basic email regex validation before saving
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        throw new Error('Invalid email format for Public Contact Email');
      }
      await updateSiteSetting('publicContactEmail', trimmed);
    }
  }

  revalidatePublicContent({ paths: ['/about', '/contact'] });
  revalidatePath('/admin/profile');
  redirect('/admin/profile');
}
