import { describe, it, expect } from 'vitest';
import { toPublicProfile } from '../../lib/dto/profile';

describe('Profile DTO tests', () => {
  it('toPublicProfile() output keys match the declared allowlist exactly', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fullProfile: any = {
      id: 'profile-1',
      fullName: 'John Doe',
      title: 'Developer',
      bio: 'Hello world',
      avatarUrl: null,
      email: 'john@example.com',
      githubUrl: null,
      linkedinUrl: null,
      twitterUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const publicDto = toPublicProfile(fullProfile);
    const allowedKeys = [
      'name', 'title', 'tagline', 'bio', 'locationLabel', 'availabilityStatus'
    ];

    expect(Object.keys(publicDto).sort()).toEqual(allowedKeys.sort());
    
    // Explicitly confirm it does NOT have private data
    expect(publicDto).not.toHaveProperty('email');
    expect(publicDto).not.toHaveProperty('adminNotes');
  });
});
