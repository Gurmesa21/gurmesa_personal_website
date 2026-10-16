import { Profile, Experience, Skill, SocialLink } from '@prisma/client';

export type PublicProfile = Pick<Profile, 'name' | 'title' | 'tagline' | 'bio' | 'locationLabel' | 'availabilityStatus'> & { avatarUrl: string | null };

export function toPublicProfile(profile: Profile & { avatarUrl?: string | null }): PublicProfile {
  return {
    name: profile.name,
    title: profile.title,
    tagline: profile.tagline,
    bio: profile.bio,
    locationLabel: profile.locationLabel,
    availabilityStatus: profile.availabilityStatus,
    avatarUrl: profile.avatarUrl || null,
  };
}

export type PublicExperience = Pick<Experience, 'id' | 'organization' | 'role' | 'startDate' | 'endDate' | 'description' | 'order'>;

export function toPublicExperience(exp: Experience): PublicExperience {
  return {
    id: exp.id,
    organization: exp.organization,
    role: exp.role,
    startDate: exp.startDate,
    endDate: exp.endDate,
    description: exp.description,
    order: exp.order,
  };
}

export type PublicSkill = Pick<Skill, 'id' | 'name' | 'category' | 'proficiencyLabel' | 'order'>;

export function toPublicSkill(skill: Skill): PublicSkill {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    proficiencyLabel: skill.proficiencyLabel,
    order: skill.order,
  };
}

export type PublicSocialLink = Pick<SocialLink, 'id' | 'platform' | 'url' | 'label' | 'order'>;

export function toPublicSocialLink(link: SocialLink): PublicSocialLink {
  return {
    id: link.id,
    platform: link.platform,
    url: link.url,
    label: link.label,
    order: link.order,
  };
}
