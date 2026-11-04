import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const OUT_DIR = 'docs/evidence/cards/shots-after';

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Running Post-Implementation Measurements and Screenshots against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  const measurements = {};

  // 1. Measure Home service card and Work page card at 375, 412, 768, 1280
  const measureWidths = [375, 412, 768, 1280];
  for (const w of measureWidths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: 'dark' });

    // Home Service Card
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const homeServiceCard = page.locator('section[aria-label="Services"] [data-card]').first();
    const homeServiceGrid = page.locator('section[aria-label="Services"] > div.grid').first();

    let homeServiceData = null;
    if (await homeServiceCard.isVisible()) {
      homeServiceData = await page.evaluate(() => {
        const card = document.querySelector('section[aria-label="Services"] [data-card]');
        const grid = document.querySelector('section[aria-label="Services"] > div.grid');
        if (!card || !grid) return null;
        const cardRect = card.getBoundingClientRect();
        const cardStyle = window.getComputedStyle(card);
        const gridStyle = window.getComputedStyle(grid);
        return {
          width: Math.round(cardRect.width),
          height: Math.round(cardRect.height),
          padding: cardStyle.padding,
          gridTemplateColumns: gridStyle.gridTemplateColumns,
          gridGap: gridStyle.gap,
        };
      });
    }

    // Home Featured Work Card
    const homeFeaturedCard = page.locator('aside[aria-label="Featured Work"] [data-card]').first();
    let homeFeaturedData = null;
    if (await homeFeaturedCard.isVisible()) {
      homeFeaturedData = await page.evaluate(() => {
        const card = document.querySelector('aside[aria-label="Featured Work"] [data-card]');
        if (!card) return null;
        const cardRect = card.getBoundingClientRect();
        const cardStyle = window.getComputedStyle(card);
        return {
          width: Math.round(cardRect.width),
          height: Math.round(cardRect.height),
          padding: cardStyle.padding,
        };
      });
    }

    // Work Page Card
    await page.goto(`${BASE_URL}/work`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    let workCardData = null;
    const workCard = page.locator('[data-card]').first();
    if (await workCard.isVisible()) {
      workCardData = await page.evaluate(() => {
        const card = document.querySelector('[data-card]');
        const grid = card?.parentElement;
        if (!card || !grid) return null;
        const cardRect = card.getBoundingClientRect();
        const cardStyle = window.getComputedStyle(card);
        const gridStyle = window.getComputedStyle(grid);
        return {
          width: Math.round(cardRect.width),
          height: Math.round(cardRect.height),
          padding: cardStyle.padding,
          gridTemplateColumns: gridStyle.gridTemplateColumns,
          gridGap: gridStyle.gap,
        };
      });
    }

    measurements[`${w}px`] = {
      homeServiceCard: homeServiceData,
      homeFeaturedWorkCard: homeFeaturedData,
      workPageCard: workCardData,
    };

    await page.close();
  }

  fs.writeFileSync('docs/evidence/cards/measurements-after.json', JSON.stringify(measurements, null, 2));
  console.log('Post-implementation measurements written to docs/evidence/cards/measurements-after.json');

  // 2. Full-page screenshots across viewports: 360x800, 375x667, 390x844, 412x915, 768x1024
  const viewports = [
    { name: '360', width: 360, height: 800 },
    { name: '375', width: 375, height: 667 },
    { name: '390', width: 390, height: 844 },
    { name: '412', width: 412, height: 915 },
    { name: '768', width: 768, height: 1024 },
  ];

  const routesEn = [
    { path: '/', name: 'home-en' },
    { path: '/services', name: 'services-en' },
    { path: '/services/web-development', name: 'service-detail-en' },
    { path: '/work', name: 'work-en' },
    { path: '/work/os-dashboard', name: 'work-detail-en' },
    { path: '/blog', name: 'blog-en' },
    { path: '/blog/first-post', name: 'blog-detail-en' },
    { path: '/about', name: 'about-en' },
    { path: '/testimonials', name: 'testimonials-en' },
    { path: '/contact', name: 'contact-en' },
  ];

  const routesAm = [
    { path: '/am', name: 'home-am' },
    { path: '/am/services', name: 'services-am' },
    { path: '/am/work', name: 'work-am' },
    { path: '/am/about', name: 'about-am' },
  ];

  const routesOm = [
    { path: '/om', name: 'home-om' },
    { path: '/om/services', name: 'services-om' },
    { path: '/om/work', name: 'work-om' },
    { path: '/om/about', name: 'about-om' },
  ];

  const allRoutes = [...routesEn, ...routesAm, ...routesOm];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: 'dark',
    });

    for (const r of allRoutes) {
      const filename = `${r.name}-${vp.name}px.png`;
      const filePath = path.join(OUT_DIR, filename);
      try {
        await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await page.waitForTimeout(600);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Captured after: ${filename}`);
      } catch (err) {
        console.error(`Error capturing ${filename}:`, err.message);
      }
    }

    await page.close();
  }

  await browser.close();
  console.log('Post-implementation screenshots complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
