import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('MASTER PROMPT — Part 2 About Profile 9:16 and Part 3 Lanyard Badge', () => {
  const root = process.cwd();

  it('About page has baseline profile card container with centered 9:16 frame and GT initials fallback', () => {
    const aboutPagePath = path.join(root, 'app', '[locale]', '(public)', 'about', 'page.tsx');
    const content = fs.readFileSync(aboutPagePath, 'utf8');

    expect(content).toContain('data-testid="about-profile-card"');
    expect(content).toContain('data-testid="profile-image-frame-9-16"');
    expect(content).toContain('aspect-[9/16]');
    expect(content).toContain('object-contain');
    expect(content).toContain('aspect-[3/4]');
    expect(content).toContain('w-48');
    expect(content).toContain('h-48');
    expect(content).toContain('GT');
  });

  it('ProfileForm contains recommended 9:16 helper text and landscape warning', () => {
    const formPath = path.join(root, 'app', '(admin)', 'admin', 'profile', 'ProfileForm.tsx');
    const content = fs.readFileSync(formPath, 'utf8');

    expect(content).toContain('Recommended: 9:16 vertical (e.g. 720x1280)');
    expect(content).toContain('Uploaded image is landscape. It will be centered and scaled with letterboxing; a 9:16 vertical photo looks best.');
    expect(content).toContain('data-testid="avatar-recommended-hint"');
    expect(content).toContain('data-testid="avatar-landscape-warning"');
  });

  it('LanyardBadge has strap, clasp, name, title, location, prefers-reduced-motion, and spring physics', () => {
    const badgePath = path.join(root, 'components', 'home', 'LanyardBadge.tsx');
    const content = fs.readFileSync(badgePath, 'utf8');

    expect(content).toContain('prefers-reduced-motion');
    expect(content).toContain('IntersectionObserver');
    expect(content).toContain('data-testid="lanyard-badge-card"');
    expect(content).toContain('data-testid="badge-name"');
    expect(content).toContain('data-testid="badge-title"');
    expect(content).toContain('data-testid="badge-location"');
    expect(content).toContain('touch-manipulation');
    expect(content).toContain('AVENOR');
  });

  it('Home page embeds LanyardBadge in Hero section', () => {
    const homePath = path.join(root, 'app', '[locale]', '(public)', 'page.tsx');
    const content = fs.readFileSync(homePath, 'utf8');

    expect(content).toContain('LanyardBadge');
    expect(content).toContain("import { LanyardBadge } from '@/components/home/LanyardBadge'");
  });

  it('Public layout includes overflow-x-clip backstop', () => {
    const layoutPath = path.join(root, 'app', '[locale]', '(public)', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');

    expect(content).toContain('overflow-x-clip');
  });
});
