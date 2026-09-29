import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateProfile,
  createExperience, updateExperience, deleteExperience,
  createSkill, updateSkill, deleteSkill,
  createSocialLink, updateSocialLink, deleteSocialLink
} from '../../server/services/profileService';
import { updateSiteSetting } from '../../server/services/siteSettingService';
import { auth } from '../../auth';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

describe('Day 10 - Admin Content Management (SEC-ACL-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).mockResolvedValue(null); // Unauthenticated by default
  });

  // Profile
  it('unauthenticated Profile update rejected', async () => {
    await expect(updateProfile({ name: 'Test' })).rejects.toThrow('Unauthorized');
  });

  // Experience
  it('unauthenticated Experience create rejected', async () => {
    await expect(createExperience({ organization: 'Org', role: 'Role', startDate: new Date(), endDate: null, description: 'Desc', order: 1 } as any)).rejects.toThrow('Unauthorized');
  });
  it('unauthenticated Experience update rejected', async () => {
    await expect(updateExperience('123', { organization: 'Org' })).rejects.toThrow('Unauthorized');
  });
  it('unauthenticated Experience delete rejected', async () => {
    await expect(deleteExperience('123')).rejects.toThrow('Unauthorized');
  });

  // Skill
  it('unauthenticated Skill create rejected', async () => {
    await expect(createSkill({ name: 'Skill', category: 'Cat', proficiencyLabel: 'Exp', order: 1 })).rejects.toThrow('Unauthorized');
  });
  it('unauthenticated Skill update rejected', async () => {
    await expect(updateSkill('123', { name: 'Skill2' })).rejects.toThrow('Unauthorized');
  });
  it('unauthenticated Skill delete rejected', async () => {
    await expect(deleteSkill('123')).rejects.toThrow('Unauthorized');
  });

  // SocialLink
  it('unauthenticated SocialLink create rejected', async () => {
    await expect(createSocialLink({ platform: 'Plat', url: 'http', label: 'Lbl', visibility: 'PUBLIC', order: 1 })).rejects.toThrow('Unauthorized');
  });
  it('unauthenticated SocialLink update rejected', async () => {
    await expect(updateSocialLink('123', { platform: 'Plat2' })).rejects.toThrow('Unauthorized');
  });
  it('unauthenticated SocialLink delete rejected', async () => {
    await expect(deleteSocialLink('123')).rejects.toThrow('Unauthorized');
  });

  // SiteSettings
  it('unauthenticated SiteSetting update rejected', async () => {
    await expect(updateSiteSetting('publicContactEmail', 'test@example.com')).rejects.toThrow('Unauthorized');
  });

  it('SiteSetting update with an unknown/non-whitelisted key is rejected', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin1', email: 'admin@example.com' } });
    await expect(updateSiteSetting('unknownKey', 'value')).rejects.toThrow('Invalid setting key');
  });

  it('SiteSetting invalid values rejected: retention out of range', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin1', email: 'admin@example.com' } });
    await expect(updateSiteSetting('inquiryRetentionDays', 10)).rejects.toThrow(/Too small/);
    await expect(updateSiteSetting('inquiryRetentionDays', 2000)).rejects.toThrow(/Too big/);
  });

  it('SiteSetting invalid values rejected: malformed email', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'admin1', email: 'admin@example.com' } });
    await expect(updateSiteSetting('publicContactEmail', 'not-an-email')).rejects.toThrow(/Invalid email/);
  });
});

import nextConfig from '../../next.config';

describe('Day 10 - SEO/headers', () => {
  it('HSTS header present when NODE_ENV=production, absent otherwise', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    let headersArr = await (nextConfig as any).headers();
    let securityHeaders = headersArr[0].headers;
    let hsts = securityHeaders.find((h: any) => h.key === 'Strict-Transport-Security');
    expect(hsts).toBeUndefined();

    vi.stubEnv('NODE_ENV', 'production');
    headersArr = await (nextConfig as any).headers();
    securityHeaders = headersArr[0].headers;
    hsts = securityHeaders.find((h: any) => h.key === 'Strict-Transport-Security');
    expect(hsts).toBeDefined();
    
    vi.unstubAllEnvs();
  });
});


