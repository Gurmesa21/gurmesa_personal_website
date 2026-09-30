import { Profile, Experience, Skill, SocialLink } from '@prisma/client';
import { profileRepository } from '../repositories/profileRepository';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';
import {
  toPublicProfile, PublicProfile,
  toPublicExperience, PublicExperience,
  toPublicSkill, PublicSkill,
  toPublicSocialLink, PublicSocialLink
} from '../../lib/dto/profile';
import { experienceRepository } from '../repositories/experienceRepository';
import { skillRepository } from '../repositories/skillRepository';
import { socialLinkRepository } from '../repositories/socialLinkRepository';

/**
 * Retrieves the profile data for public consumption, stripped of any private fields.
 */
export async function getPublicProfile(): Promise<PublicProfile | null> {
  const profiles = await profileRepository.findMany();
  const profile = profiles[0];
  if (!profile) return null;
  return toPublicProfile(profile);
}

export async function getPublicExperiences(): Promise<PublicExperience[]> {
  const experiences = await experienceRepository.findMany({
    orderBy: { order: 'asc' },
  });
  return experiences.map(toPublicExperience);
}

export async function getPublicSkills(): Promise<PublicSkill[]> {
  const skills = await skillRepository.findMany({
    orderBy: { order: 'asc' },
  });
  return skills.map(toPublicSkill);
}

export async function getPublicSocialLinks(): Promise<PublicSocialLink[]> {
  const links = await socialLinkRepository.findMany({
    where: { visibility: 'PUBLIC' },
    orderBy: { order: 'asc' },
  });
  return links.map(toPublicSocialLink);
}

/**
 * Retrieves the full profile data. 
 * MUST only be called from an authenticated admin context.
 */
export async function getAdminProfile() {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  const profiles = await profileRepository.findMany();
  return profiles[0] || null;
}

export async function updateProfile(data: Partial<Profile>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  
  const profiles = await profileRepository.findMany();
  const profile = profiles[0];
  if (!profile) throw new Error('Profile not found');
  
  const result = await profileRepository.update({
    where: { id: profile.id },
    data
  });
  await logAdminAction({ action: 'UPDATE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}

// Experience Admin
export async function createExperience(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await experienceRepository.create({ data });
  await logAdminAction({ action: 'CREATE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}
export async function updateExperience(id: string, data: Partial<Experience>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await experienceRepository.update({ where: { id }, data });
  await logAdminAction({ action: 'UPDATE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}
export async function deleteExperience(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await experienceRepository.delete({ where: { id } });
  await logAdminAction({ action: 'DELETE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}

// Skill Admin
export async function createSkill(data: Omit<Skill, 'id'>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await skillRepository.create({ data });
  await logAdminAction({ action: 'CREATE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}
export async function updateSkill(id: string, data: Partial<Skill>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await skillRepository.update({ where: { id }, data });
  await logAdminAction({ action: 'UPDATE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}
export async function deleteSkill(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await skillRepository.delete({ where: { id } });
  await logAdminAction({ action: 'DELETE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}

// SocialLink Admin
export async function createSocialLink(data: Omit<SocialLink, 'id'>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await socialLinkRepository.create({ data });
  await logAdminAction({ action: 'CREATE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}
export async function updateSocialLink(id: string, data: Partial<SocialLink>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await socialLinkRepository.update({ where: { id }, data });
  await logAdminAction({ action: 'UPDATE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}
export async function deleteSocialLink(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  const result = await socialLinkRepository.delete({ where: { id } });
  await logAdminAction({ action: 'DELETE', entity: 'Profile', entityId: result?.id || 'unknown' });
  return result;
}
