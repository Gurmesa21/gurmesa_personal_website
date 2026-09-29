import { Profile, Experience, Skill, SocialLink } from '@prisma/client';
import { profileRepository } from '../repositories/profileRepository';
import { auth } from '../../auth';
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
  
  return profileRepository.update({
    where: { id: profile.id },
    data
  });
}

// Experience Admin
export async function createExperience(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return experienceRepository.create({ data });
}
export async function updateExperience(id: string, data: Partial<Experience>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return experienceRepository.update({ where: { id }, data });
}
export async function deleteExperience(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return experienceRepository.delete({ where: { id } });
}

// Skill Admin
export async function createSkill(data: Omit<Skill, 'id'>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return skillRepository.create({ data });
}
export async function updateSkill(id: string, data: Partial<Skill>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return skillRepository.update({ where: { id }, data });
}
export async function deleteSkill(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return skillRepository.delete({ where: { id } });
}

// SocialLink Admin
export async function createSocialLink(data: Omit<SocialLink, 'id'>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return socialLinkRepository.create({ data });
}
export async function updateSocialLink(id: string, data: Partial<SocialLink>) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return socialLinkRepository.update({ where: { id }, data });
}
export async function deleteSocialLink(id: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return socialLinkRepository.delete({ where: { id } });
}
