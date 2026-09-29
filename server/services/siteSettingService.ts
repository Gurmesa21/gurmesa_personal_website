import { siteSettingRepository } from '../repositories/siteSettingRepository';
import { auth } from '../../auth';
import { z } from 'zod';

const siteSettingWhitelist = [
  'publicContactEmail',
  'inquiryRetentionDays',
  'sendVisitorAcknowledgement',
  'availabilityMessage'
] as const;

export type SiteSettingKey = typeof siteSettingWhitelist[number];

const schemas = {
  publicContactEmail: z.string().email(),
  inquiryRetentionDays: z.number().int().min(30).max(1825),
  sendVisitorAcknowledgement: z.boolean(),
  availabilityMessage: z.string(),
};

export async function getAdminSiteSettings() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  
  const settings = await siteSettingRepository.findMany();
  return settings;
}

export async function updateSiteSetting(key: string, value: any) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  if (!siteSettingWhitelist.includes(key as any)) {
    throw new Error('Invalid setting key');
  }

  const k = key as SiteSettingKey;
  
  // validate value
  const parsedValue = schemas[k].parse(value);

  return siteSettingRepository.upsert({
    where: { key: k },
    update: { value: parsedValue },
    create: { key: k, value: parsedValue, type: typeof parsedValue }
  });
}
