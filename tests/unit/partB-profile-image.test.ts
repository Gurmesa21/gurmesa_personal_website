import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('MASTER PROMPT — Part B About Profile LanyardBadge', () => {
  const root = process.cwd();

  it('About page has baseline profile card container with hanging LanyardBadge size="about"', () => {
    const aboutPagePath = path.join(root, 'app', '[locale]', '(public)', 'about', 'page.tsx');
    const content = fs.readFileSync(aboutPagePath, 'utf8');

    expect(content).toContain('data-testid="about-profile-card"');
    expect(content).toContain('LanyardBadge');
    expect(content).toContain('size="about"');
  });

  it('ProfileForm contains recommended portrait helper text and landscape warning', () => {
    const formPath = path.join(root, 'app', '(admin)', 'admin', 'profile', 'ProfileForm.tsx');
    const content = fs.readFileSync(formPath, 'utf8');

    expect(content).toContain('Photo is shown in a portrait badge');
    expect(content).toContain('Uploaded image is landscape. The badge crops the photo to a portrait');
    expect(content).toContain('data-testid="avatar-recommended-hint"');
    expect(content).toContain('data-testid="avatar-landscape-warning"');
  });

  it('LanyardBadge has strap, clasp, name, title, location, prefers-reduced-motion, and supports hero and about sizes', () => {
    const badgePath = path.join(root, 'components', 'home', 'LanyardBadge.tsx');
    const content = fs.readFileSync(badgePath, 'utf8');

    expect(content).toContain('prefers-reduced-motion');
    expect(content).toContain('IntersectionObserver');
    expect(content).toContain('data-testid="lanyard-badge-card"');
    expect(content).toContain('data-testid="badge-name"');
    expect(content).toContain('data-testid="badge-title"');
    expect(content).toContain('data-testid="badge-location"');
    expect(content).toContain('touch-manipulation');
    expect(content).toContain('size?:');
    expect(content).toContain('hero');
    expect(content).toContain('about');
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
