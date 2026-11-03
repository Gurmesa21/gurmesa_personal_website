import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Part B & Task 3 — About Profile 9:16 and Hero Engineer ID Badge', () => {
  const root = process.cwd();

  it('About page has small profile card with centered 9:16 frame and GT initials fallback', () => {
    const aboutPagePath = path.join(root, 'app', '[locale]', '(public)', 'about', 'page.tsx');
    const content = fs.readFileSync(aboutPagePath, 'utf8');

    expect(content).toContain('data-testid="about-profile-card"');
    expect(content).toContain('data-testid="profile-image-frame-9-16"');
    expect(content).toContain('aspect-[9/16]');
    expect(content).toContain('object-contain');
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

  it('EngineerBadge has 3D tilt, prefers-reduced-motion, and ASTU student line', () => {
    const badgePath = path.join(root, 'components', 'home', 'EngineerBadge.tsx');
    const content = fs.readFileSync(badgePath, 'utf8');

    expect(content).toContain('prefers-reduced-motion');
    expect(content).toContain('IntersectionObserver');
    expect(content).toContain('ASTU');
    expect(content).toContain('AVN-');
    expect(content).toContain('Next.js');
    expect(content).toContain('TypeScript');
    expect(content).toContain('data-testid="engineer-badge"');
  });

  it('Home page embeds EngineerBadge in Hero section', () => {
    const homePath = path.join(root, 'app', '[locale]', '(public)', 'page.tsx');
    const content = fs.readFileSync(homePath, 'utf8');

    expect(content).toContain('EngineerBadge');
    expect(content).toContain('import { EngineerBadge }');
  });

  it('Public layout includes TouchHighlightManager and overflow-x-clip backstop', () => {
    const layoutPath = path.join(root, 'app', '[locale]', '(public)', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');

    expect(content).toContain('TouchHighlightManager');
    expect(content).toContain('overflow-x-clip');
  });
});

