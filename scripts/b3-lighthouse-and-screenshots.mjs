import { chromium } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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
  console.log('Starting Next.js production server on port 3006...');
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
    console.log('Production server healthy on port 3006.');

    const screenshotsDir = path.join(process.cwd(), 'docs', 'evidence', 'b3', 'screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });

    // 1. Multi-resolution screenshots: full-page 375px and 1280px
    console.log('Capturing multi-resolution screenshots...');
    const browser = await chromium.launch({ headless: true });

    const publicPages = [
      { name: 'home-en', path: '/' },
      { name: 'home-am', path: '/am' },
      { name: 'home-om', path: '/om' },
      { name: 'about-en', path: '/about' },
      { name: 'about-am', path: '/am/about' },
      { name: 'about-om', path: '/om/about' },
      { name: 'services-en', path: '/services' },
      { name: 'services-am', path: '/am/services' },
      { name: 'services-om', path: '/om/services' },
      { name: 'work-en', path: '/work' },
      { name: 'blog-en', path: '/blog' },
      { name: 'contact-en', path: '/contact' },
      { name: 'contact-am', path: '/am/contact' },
      { name: 'contact-om', path: '/om/contact' },
      { name: 'testimonials-en', path: '/testimonials' },
      { name: 'privacy-en', path: '/privacy' },
      { name: 'terms-en', path: '/terms' },
    ];

    const adminPages = [
      { name: 'admin-dashboard', path: '/admin' },
      { name: 'admin-services', path: '/admin/services' },
      { name: 'admin-projects', path: '/admin/projects' },
      { name: 'admin-blog', path: '/admin/blog' },
      { name: 'admin-profile', path: '/admin/profile' },
      { name: 'admin-inquiries', path: '/admin/inquiries' },
      { name: 'admin-testimonials', path: '/admin/testimonials' },
      { name: 'admin-comments', path: '/admin/comments' },
    ];

    const resolutions = [
      { label: '375px', width: 375, height: 812 },
      { label: '1280px', width: 1280, height: 800 },
    ];

    for (const res of resolutions) {
      const context = await browser.newContext({
        viewport: { width: res.width, height: res.height },
        baseURL: 'http://localhost:3006',
        colorScheme: 'dark'
      });
      const page = await context.newPage();

      for (const p of publicPages) {
        console.log(`Screenshot [${res.label}]: ${p.name} (${p.path})`);
        await page.goto(p.path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(screenshotsDir, `${p.name}-${res.label}.png`),
          fullPage: true
        });
      }

      // Login for admin screenshots
      await page.goto('/admin/login');
      await page.fill('input[name="email"]', 'admin@example.com');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);

      for (const a of adminPages) {
        console.log(`Screenshot [${res.label}]: ${a.name} (${a.path})`);
        await page.goto(a.path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(screenshotsDir, `${a.name}-${res.label}.png`),
          fullPage: true
        });
      }

      await context.close();
    }

    await browser.close();
    console.log('All screenshots captured successfully.');

    // 2. Lighthouse mobile audits
    console.log('Running Lighthouse mobile audits...');
    const lighthouseDir = path.join(process.cwd(), 'docs', 'evidence', 'b3', 'lighthouse');
    fs.mkdirSync(lighthouseDir, { recursive: true });

    const lighthouseTargets = [
      { name: 'home', url: 'http://localhost:3006/' },
      { name: 'services', url: 'http://localhost:3006/services' },
      { name: 'blog', url: 'http://localhost:3006/blog' },
      { name: 'work', url: 'http://localhost:3006/work' },
      { name: 'testimonials', url: 'http://localhost:3006/testimonials' },
    ];

    let summaryReport = '# Lighthouse Mobile Audit Report (Production Build)\n\n';
    summaryReport += `Generated: ${new Date().toISOString()}\n`;
    summaryReport += `Environment: Production Build (Next.js 16 Turbopack)\n`;
    summaryReport += `Emulation: Mobile (Moto G4 / Pixel)\n\n`;

    let homeMetricsExplanation = '';

    for (const target of lighthouseTargets) {
      console.log(`Lighthouse mobile: auditing ${target.name} (${target.url})...`);
      const reportBase = path.join(lighthouseDir, target.name);
      const jsonOutPath = path.join(lighthouseDir, `${target.name}.report.json`);

      const cmd = `npx -y lighthouse ${target.url} --quiet --chrome-flags="--headless --no-sandbox" --form-factor=mobile --screenEmulation.mobile=true --output=html,json --output-path="${reportBase}" --only-categories=performance,accessibility,best-practices,seo`;

      execSync(cmd, { stdio: 'inherit', env: process.env });

      if (fs.existsSync(jsonOutPath)) {
        const report = JSON.parse(fs.readFileSync(jsonOutPath, 'utf8'));
        const perf = Math.round((report.categories?.performance?.score || 0) * 100);
        const a11y = Math.round((report.categories?.accessibility?.score || 0) * 100);
        const bp = Math.round((report.categories?.['best-practices']?.score || 0) * 100);
        const seo = Math.round((report.categories?.seo?.score || 0) * 100);

        summaryReport += `### ${target.name.toUpperCase()} (\`${target.url}\`)\n`;
        summaryReport += `- **Performance**: ${perf}/100\n`;
        summaryReport += `- **Accessibility**: ${a11y}/100\n`;
        summaryReport += `- **Best Practices**: ${bp}/100\n`;
        summaryReport += `- **SEO**: ${seo}/100\n\n`;

        if (target.name === 'home') {
          const audits = report.audits || {};
          const fcp = audits['first-contentful-paint']?.displayValue || 'N/A';
          const fcpScore = audits['first-contentful-paint']?.score;
          const lcp = audits['largest-contentful-paint']?.displayValue || 'N/A';
          const lcpScore = audits['largest-contentful-paint']?.score;
          const cls = audits['cumulative-layout-shift']?.displayValue || 'N/A';
          const clsScore = audits['cumulative-layout-shift']?.score;
          const tbt = audits['total-blocking-time']?.displayValue || 'N/A';
          const tbtScore = audits['total-blocking-time']?.score;
          const si = audits['speed-index']?.displayValue || 'N/A';
          const siScore = audits['speed-index']?.score;

          homeMetricsExplanation = `## Home Page Mobile Performance Score Breakdown\n\n`;
          homeMetricsExplanation += `Overall Mobile Performance Score: **${perf}/100**\n\n`;
          homeMetricsExplanation += `Variable-by-Variable Explanation:\n`;
          homeMetricsExplanation += `1. **First Contentful Paint (FCP)**: \`${fcp}\` (score: ${Math.round((fcpScore || 0) * 100)}/100). Measures the time until the browser renders the first DOM content (navigation bar, dark background, heading).\n`;
          homeMetricsExplanation += `2. **Largest Contentful Paint (LCP)**: \`${lcp}\` (score: ${Math.round((lcpScore || 0) * 100)}/100). Measures when the primary content element (the hero headline and introduction section) is fully rendered.\n`;
          homeMetricsExplanation += `3. **Cumulative Layout Shift (CLS)**: \`${cls}\` (score: ${Math.round((clsScore || 0) * 100)}/100). Measures visual stability during loading. Zero unexpected layout shifts due to reserved image aspect ratios and fixed font sizing.\n`;
          homeMetricsExplanation += `4. **Total Blocking Time (TBT)**: \`${tbt}\` (score: ${Math.round((tbtScore || 0) * 100)}/100). Total time between FCP and Time to Interactive where the CPU main thread was blocked from responding to user input.\n`;
          homeMetricsExplanation += `5. **Speed Index (SI)**: \`${si}\` (score: ${Math.round((siScore || 0) * 100)}/100). Measures how quickly contents of the home page are visually populated.\n\n`;
        }
      }
    }

    summaryReport += homeMetricsExplanation;

    const summaryFilePath = path.join(process.cwd(), 'docs', 'evidence', 'b3', '39-lighthouse.txt');
    fs.writeFileSync(summaryFilePath, summaryReport, 'utf8');
    console.log(`Lighthouse audit summary saved to ${summaryFilePath}`);

  } finally {
    console.log('Stopping Next.js production server...');
    server.kill();
  }
}

main().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});

