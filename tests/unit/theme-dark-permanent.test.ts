import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 11 — Permanent Dark Theme Verification', () => {
  const rootDir = process.cwd();

  it('Root layout sets dark class and ThemeProvider with forced dark theme', () => {
    const layoutPath = path.join(rootDir, 'app', '[locale]', 'layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');

    expect(content).toContain('dark');
    expect(content).toContain('defaultTheme="dark"');
    expect(content).toContain('forcedTheme="dark"');
    expect(content).toContain('enableSystem={false}');
  });

  it('Admin layout sets dark class on html root', () => {
    const adminLayoutPath = path.join(rootDir, 'app', '(admin)', 'layout.tsx');
    const content = fs.readFileSync(adminLayoutPath, 'utf8');

    expect(content).toContain('className="dark"');
  });

  it('Public Header component has no ThemeToggle or theme switching controls', () => {
    const headerPath = path.join(rootDir, 'components', 'layout', 'header.tsx');
    const content = fs.readFileSync(headerPath, 'utf8');

    expect(content).not.toContain('ThemeToggle');
    expect(content).not.toContain('setTheme');
    expect(content).not.toContain('useTheme');
  });

  it('globals.css applies dark theme background and foreground tokens to :root', () => {
    const cssPath = path.join(rootDir, 'app', 'globals.css');
    const content = fs.readFileSync(cssPath, 'utf8');

    expect(content).toContain('--background: #080B16');
    expect(content).toContain('--foreground: #F5F6FC');
  });
});

