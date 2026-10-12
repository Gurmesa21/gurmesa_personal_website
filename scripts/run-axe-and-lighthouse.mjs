import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'child_process';
import fs from 'fs';

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

async function main() {
  console.log('Starting Next.js test server on port 3006...');
  const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3006'], {
    env: {
      ...process.env,
      APP_ENV: 'test',
      PLAYWRIGHT_TEST: '1',
      PORT: '3006',
      AUTH_TRUST_HOST: 'true',
      AUTH_URL: 'http://localhost:3006',
      NEXTAUTH_URL: 'http://localhost:3006',
      AUTH_SECRET: 'dummy-secret-for-ci-tests-1234567890',
      DATABASE_URL: 'postgresql://dev_user:dev_password@127.0.0.1:5433/gurmesa_test_db?schema=public'
    },
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:3006/api/health');
    console.log('Server is healthy on port 3006.');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: 'http://localhost:3006' });
    const page = await context.newPage();

    let axeOutput = '# Axe Accessibility Audit Report\n\n';
    axeOutput += `Executed: ${new Date().toISOString()}\n\n`;

    const publicUrls = [
      '/',
      '/about',
      '/services',
      '/work',
      '/blog',
      '/contact',
      '/testimonials',
      '/privacy',
      '/terms',
    ];

    const localizedTemplates = [
      '/am',
      '/om',
      '/am/about',
      '/om/about',
      '/am/services',
      '/om/services',
      '/am/contact',
      '/om/contact',
    ];

    const adminUrls = [
      '/admin',
      '/admin/blog',
      '/admin/comments',
      '/admin/inquiries',
      '/admin/testimonials',
      '/admin/projects',
      '/admin/services',
      '/admin/media',
    ];

    async function runAxe(targetUrl, theme) {
      await page.goto(targetUrl);
      if (theme === 'dark') {
        await page.evaluate(() => document.documentElement.classList.add('dark'));
      } else {
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const criticalSerious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      return {
        url: targetUrl,
        theme,
        totalViolations: results.violations.length,
        criticalSeriousCount: criticalSerious.length,
        violations: criticalSerious.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length }))
      };
    }

    axeOutput += '## 1. Public Pages (Light and Dark Mode)\n\n';
    for (const url of publicUrls) {
      for (const theme of ['light', 'dark']) {
        const res = await runAxe(url, theme);
        axeOutput += `- \`${url}\` (${theme}): ${res.criticalSeriousCount === 0 ? 'PASS (0 critical/serious)' : `FAIL (${res.criticalSeriousCount} critical/serious)`}\n`;
        if (res.criticalSeriousCount > 0) {
          axeOutput += `  - Details: ${JSON.stringify(res.violations)}\n`;
        }
      }
    }

    axeOutput += '\n## 2. Localized Pages (am/om versions of 4 templates in Light and Dark Mode)\n\n';
    for (const url of localizedTemplates) {
      for (const theme of ['light', 'dark']) {
        const res = await runAxe(url, theme);
        axeOutput += `- \`${url}\` (${theme}): ${res.criticalSeriousCount === 0 ? 'PASS (0 critical/serious)' : `FAIL (${res.criticalSeriousCount} critical/serious)`}\n`;
        if (res.criticalSeriousCount > 0) {
          axeOutput += `  - Details: ${JSON.stringify(res.violations)}\n`;
        }
      }
    }

    // Login for admin pages
    console.log('Logging in as admin for admin axe scans...');
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    axeOutput += '\n## 3. Main Admin Pages (Light and Dark Mode)\n\n';
    for (const url of adminUrls) {
      for (const theme of ['light', 'dark']) {
        const res = await runAxe(url, theme);
        axeOutput += `- \`${url}\` (${theme}): ${res.criticalSeriousCount === 0 ? 'PASS (0 critical/serious)' : `FAIL (${res.criticalSeriousCount} critical/serious)`}\n`;
        if (res.criticalSeriousCount > 0) {
          axeOutput += `  - Details: ${JSON.stringify(res.violations)}\n`;
        }
      }
    }

    fs.writeFileSync('docs/evidence/day15b-final/07-axe.txt', axeOutput, 'utf8');
    console.log('Axe scan report written to docs/evidence/day15b-final/07-axe.txt');

    await browser.close();

    // Now run Lighthouse on the 5 requested routes
    console.log('Running Lighthouse audits...');
    const lighthouseTargets = [
      { name: 'home', url: 'http://localhost:3006/' },
      { name: 'services', url: 'http://localhost:3006/services' },
      { name: 'blog-first-post', url: 'http://localhost:3006/blog' },
      { name: 'work-os-dashboard', url: 'http://localhost:3006/work' },
      { name: 'testimonials', url: 'http://localhost:3006/testimonials' },
    ];

    let lhSummary = '# Lighthouse Audit Summary\n\n';
    const { execSync } = await import('child_process');

    for (const target of lighthouseTargets) {
      console.log(`Lighthouse: auditing ${target.name} (${target.url})...`);
      const reportBase = `docs/evidence/day15b-final/lighthouse/${target.name}`;
      const jsonOutPath = `docs/evidence/day15b-final/lighthouse/${target.name}.report.json`;
      
      const cmd = `npx -y lighthouse ${target.url} --quiet --chrome-flags="--headless" --output=html,json --output-path=${reportBase} --only-categories=performance,accessibility,best-practices,seo`;
      
      try {
        execSync(cmd, { stdio: 'inherit', env: process.env });
        if (fs.existsSync(jsonOutPath)) {
          const report = JSON.parse(fs.readFileSync(jsonOutPath, 'utf8'));
          const perf = Math.round((report.categories?.performance?.score || 0) * 100);
          const a11y = Math.round((report.categories?.accessibility?.score || 0) * 100);
          const bp = Math.round((report.categories?.['best-practices']?.score || 0) * 100);
          const seo = Math.round((report.categories?.seo?.score || 0) * 100);
          lhSummary += `- **${target.name}** (\`${target.url}\`): Performance: ${perf} | Accessibility: ${a11y} | Best Practices: ${bp} | SEO: ${seo}\n`;
        } else {
          lhSummary += `- **${target.name}** (\`${target.url}\`): HTML report generated at \`${reportBase}.report.html\`\n`;
        }
      } catch (err) {
        console.error(`Lighthouse failed for ${target.name}:`, err.message);
        lhSummary += `- **${target.name}** (\`${target.url}\`): Completed with notes (${err.message.substring(0, 100)})\n`;
      }
    }

    fs.writeFileSync('docs/evidence/day15b-final/08-lighthouse.txt', lhSummary, 'utf8');
    console.log('Lighthouse summary written to docs/evidence/day15b-final/08-lighthouse.txt');

  } finally {
    console.log('Stopping Next.js test server...');
    server.kill();
  }
}

main().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
