#!/usr/bin/env node

/**
 * Performance Baseline Measurement Script
 * 
 * Usage:
 *   node scripts/perf-baseline.mjs [baseUrl]
 *   e.g. node scripts/perf-baseline.mjs http://localhost:3000
 */

import { performance } from 'perf_hooks';

const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

console.log(`\n======================================================`);
console.log(`PERFORMANCE BASELINE MEASUREMENT: ${baseUrl}`);
console.log(`======================================================\n`);

async function measureRequest(url) {
  const start = performance.now();
  let ttfb = 0;
  let status = 0;
  let size = 0;
  let bodyText = '';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PerfBaseline/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
    });

    ttfb = performance.now() - start;
    status = res.status;

    const buffer = await res.arrayBuffer();
    size = buffer.byteLength;
    const total = performance.now() - start;

    try {
      bodyText = new TextDecoder('utf-8').decode(buffer);
    } catch {
      // Binary response
    }

    return {
      status,
      ttfb: Math.round(ttfb),
      total: Math.round(total),
      size,
      bodyText,
    };
  } catch (err) {
    return {
      status: 0,
      ttfb: 0,
      total: Math.round(performance.now() - start),
      size: 0,
      error: err.message,
      bodyText: '',
    };
  }
}

function extractFirstLink(html, entity) {
  const regex = new RegExp(`href=["']((?:/[a-z]{2})?/${entity}/[^"']+)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1].replace(/&amp;/g, '&') : null;
}

function extractFirstMedia(html) {
  let videoUrl = null;
  let imageUrl = null;

  // Search for video src
  const videoMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
                     html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|webm)[^"']*)["']/i);
  if (videoMatch) {
    videoUrl = videoMatch[1].replace(/&amp;/g, '&');
  }

  // Search for img src
  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
  for (const match of imgMatches) {
    const src = match[1];
    if (!src.startsWith('data:') && !src.includes('svg')) {
      imageUrl = src.replace(/&amp;/g, '&');
      break;
    }
  }

  return { videoUrl, imageUrl };
}

function resolveUrl(relativeOrAbsolute) {
  if (!relativeOrAbsolute) return null;
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  return `${baseUrl}${relativeOrAbsolute.startsWith('/') ? '' : '/'}${relativeOrAbsolute}`;
}

async function run() {
  const targets = [
    { name: 'Home Page', path: '/' },
    { name: 'Services Page', path: '/services' },
    { name: 'Work Page', path: '/work' },
  ];

  // 1. Discover detail links and media assets
  console.log('Discovering page routes and media assets...');
  const homeRes = await measureRequest(`${baseUrl}/`);
  const servicesRes = await measureRequest(`${baseUrl}/services`);
  const workRes = await measureRequest(`${baseUrl}/work`);

  const firstServiceSlug = extractFirstLink(servicesRes.bodyText, 'services') || '/services/web-development';
  const firstWorkSlug = extractFirstLink(workRes.bodyText, 'work') || '/work/fog';

  const combinedHtml = `${homeRes.bodyText}\n${servicesRes.bodyText}\n${workRes.bodyText}`;
  const media = extractFirstMedia(combinedHtml);

  targets.push({ name: 'First Service Detail', path: firstServiceSlug });
  targets.push({ name: 'First Work Detail', path: firstWorkSlug });

  if (media.videoUrl) {
    targets.push({ name: 'First Video Asset', rawUrl: resolveUrl(media.videoUrl) });
  }
  if (media.imageUrl) {
    targets.push({ name: 'First Image Asset', rawUrl: resolveUrl(media.imageUrl) });
  }

  console.log(`Identified ${targets.length} test targets.`);
  console.log('------------------------------------------------------\n');

  const results = [];

  for (const target of targets) {
    const fullUrl = target.rawUrl || `${baseUrl}${target.path}`;
    const displayPath = target.path || fullUrl;
    console.log(`Testing: ${target.name} (${displayPath})`);

    const targetRuns = [];
    for (let i = 1; i <= 3; i++) {
      const label = i === 1 ? 'Run 1 (Cold)' : `Run ${i} (Warm)`;
      const measurement = await measureRequest(fullUrl);
      targetRuns.push({
        name: target.name,
        path: displayPath,
        run: label,
        status: measurement.status,
        ttfb: measurement.ttfb,
        total: measurement.total,
        sizeKb: (measurement.size / 1024).toFixed(1),
      });
      // Short delay between iterations
      await new Promise((r) => setTimeout(r, 200));
    }
    results.push(...targetRuns);
  }

  console.log('\n======================================================');
  console.log('MEASUREMENT RESULTS TABLE');
  console.log('======================================================\n');

  console.table(
    results.map((r) => ({
      Target: r.name,
      Run: r.run,
      Status: r.status,
      'TTFB (ms)': r.ttfb,
      'Total (ms)': r.total,
      'Size (KB)': r.sizeKb,
    }))
  );

  console.log('\n======================================================');
  console.log('SUMMARY AVERAGES (Warm Runs 2 & 3)');
  console.log('======================================================');

  const summary = targets.map((t) => {
    const displayPath = t.path || t.rawUrl;
    const warmRuns = results.filter((r) => r.name === t.name && r.run.includes('Warm'));
    const avgTtfb = Math.round(warmRuns.reduce((acc, r) => acc + r.ttfb, 0) / warmRuns.length);
    const avgTotal = Math.round(warmRuns.reduce((acc, r) => acc + r.total, 0) / warmRuns.length);
    return {
      Target: t.name,
      'Avg Warm TTFB (ms)': avgTtfb,
      'Avg Warm Total (ms)': avgTotal,
    };
  });

  console.table(summary);
  console.log('Baseline measurement complete.\n');
}

run().catch((err) => {
  console.error('Fatal error during benchmark:', err);
  process.exit(1);
});

