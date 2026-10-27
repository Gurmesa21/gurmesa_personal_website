import { siteSettingRepository } from '../repositories/siteSettingRepository';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';
import { z } from 'zod';

const siteSettingWhitelist = [
  'publicContactEmail',
  'inquiryRetentionDays',
  'sendVisitorAcknowledgement',
  'availabilityMessage',
  'resumeMediaId'
] as const;

export type SiteSettingKey = typeof siteSettingWhitelist[number];

const schemas = {
  publicContactEmail: z.string().trim().email().max(254),
  inquiryRetentionDays: z.number().int().min(30).max(1825),
  sendVisitorAcknowledgement: z.boolean(),
  availabilityMessage: z.string(),
  resumeMediaId: z.string(),
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

  const result = await siteSettingRepository.upsert({
    where: { key: k },
    update: { value: parsedValue },
    create: { key: k, value: parsedValue, type: typeof parsedValue }
  });
  
  await logAdminAction({
    action: 'UPDATE',
    entity: 'SiteSetting',
    entityId: k,
    metadata: { value: parsedValue }
  });
  
  return result;
}
