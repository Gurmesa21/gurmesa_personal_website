import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Task 10 - Axe Accessibility Scan (8 Public + 4 Admin Pages)', () => {
  const publicRoutes = [
    '/',
    '/about',
    '/services',
    '/work',
    '/blog',
    '/contact',
    '/privacy',
    '/terms'
  ];

  const adminRoutes = [
    '/admin/login',
    '/admin',
    '/admin/services',
    '/admin/profile'
  ];

  test('run axe in dark theme and report violation counts and contrast failures', async ({ page }) => {
    test.setTimeout(120000);
    const report: Record<string, { totalViolations: number; critical: number; serious: number; contrastFailures: number; documentTitlePassed: boolean; violations: any[] }> = {};

    // 1. Scan 8 public pages
    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const contrast = results.violations.filter(v => v.id === 'color-contrast');
      const critical = results.violations.filter(v => v.impact === 'critical');
      const serious = results.violations.filter(v => v.impact === 'serious');
      const docTitleViolation = results.violations.some(v => v.id === 'document-title');

      report[route] = {
        totalViolations: results.violations.length,
        critical: critical.length,
        serious: serious.length,
        contrastFailures: contrast.length,
        documentTitlePassed: !docTitleViolation,
        violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, help: v.help }))
      };

      // Public pages should have zero critical or serious accessibility violations
      const criticalOrSerious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      expect(criticalOrSerious, `Critical/serious accessibility violations on public route ${route}`).toEqual([]);
    }

    // 2. Scan /admin/login unauthenticated
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    const loginResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const loginContrast = loginResults.violations.filter(v => v.id === 'color-contrast');
    const loginDocTitle = loginResults.violations.some(v => v.id === 'document-title');
    report['/admin/login'] = {
      totalViolations: loginResults.violations.length,
      critical: loginResults.violations.filter(v => v.impact === 'critical').length,
      serious: loginResults.violations.filter(v => v.impact === 'serious').length,
      contrastFailures: loginContrast.length,
      documentTitlePassed: !loginDocTitle,
      violations: loginResults.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, help: v.help }))
    };

    // 3. Authenticate for remaining admin pages
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');

    const authenticatedAdminRoutes = adminRoutes.filter((r) => r !== '/admin/login');
    for (const route of authenticatedAdminRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const contrast = results.violations.filter(v => v.id === 'color-contrast');
      const docTitleViolation = results.violations.some(v => v.id === 'document-title');

      report[route] = {
        totalViolations: results.violations.length,
        critical: results.violations.filter(v => v.impact === 'critical').length,
        serious: results.violations.filter(v => v.impact === 'serious').length,
        contrastFailures: contrast.length,
        documentTitlePassed: !docTitleViolation,
        violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, help: v.help }))
      };

      // Ensure document-title passes on all admin pages
      expect(docTitleViolation, `Document title failed on admin route ${route}`).toBe(false);
    }

    // Write full audit evidence
    const outDir = path.join(process.cwd(), 'docs', 'evidence', 'fix-a2');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, '10_axe_report.json'), JSON.stringify(report, null, 2));
  });
});
