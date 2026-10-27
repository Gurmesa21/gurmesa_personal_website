'use server';

import { updateSiteSetting } from '@/server/services/siteSettingService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateSettingsAction(formData: FormData) {
  const publicContactEmail = formData.get('publicContactEmail') as string;
  const inquiryRetentionDaysRaw = parseInt(formData.get('inquiryRetentionDays') as string, 10);
  const inquiryRetentionDays = isNaN(inquiryRetentionDaysRaw) ? 30 : inquiryRetentionDaysRaw;
  const sendVisitorAcknowledgement = formData.get('sendVisitorAcknowledgement') === 'on';
  const availabilityMessage = formData.get('availabilityMessage') as string;

  await updateSiteSetting('publicContactEmail', publicContactEmail);
  await updateSiteSetting('inquiryRetentionDays', inquiryRetentionDays);
  await updateSiteSetting('sendVisitorAcknowledgement', sendVisitorAcknowledgement);
  await updateSiteSetting('availabilityMessage', availabilityMessage);

  revalidatePath('/admin/settings');
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/contact');
  revalidatePath('/', 'layout');
  revalidatePath('/[locale]/contact', 'page');
  revalidatePath('/[locale]/about', 'page');
  redirect('/admin/settings');
}
