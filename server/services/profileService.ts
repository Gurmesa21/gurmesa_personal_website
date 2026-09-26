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
