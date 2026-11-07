#!/usr/bin/env node
/**
 * scripts/check-sitemap.mjs
 * Read-only SEO & sitemap health verification script.
 * Usage: node scripts/check-sitemap.mjs [baseUrl]
 */

const rawBaseUrl = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
const baseUrl = rawBaseUrl.replace(/\/+$/, '');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractLocs(xml) {
  const locRegex = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    if (match[1]) {
      urls.push(match[1].trim());
    }
  }
  return urls;
}

async function inspectUrl(url, expectedOrigin, requestOrigin) {
  try {
    // If testing against a local host, map the target URL path to requestOrigin
    let fetchUrl = url;
    if (requestOrigin && (requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1'))) {
      const parsed = new URL(url);
      fetchUrl = `${requestOrigin}${parsed.pathname}`;
    }

    const res = await fetch(fetchUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Gurmesa-SEO-HealthCheck/1.0',
      },
    });

    const status = res.status;
    const xRobots = res.headers.get('x-robots-tag') || '';
    const isNoIndexHeader = /noindex/i.test(xRobots);

    let isNoIndexMeta = false;
    let title = '';
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('text/html') && status === 200) {
      const body = await res.text();
      const metaRobotsMatch = body.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
      if (metaRobotsMatch && /noindex/i.test(metaRobotsMatch[0])) {
        isNoIndexMeta = true;
      }
      const titleMatch = body.match(/<title>([^<]*)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }

    const parsed = new URL(url);
    const originMatch = expectedOrigin ? parsed.origin === expectedOrigin : true;

    const ok = status === 200 && !isNoIndexHeader && !isNoIndexMeta;

    return {
      url,
      status,
      originMatch,
      hasNoIndex: isNoIndexHeader || isNoIndexMeta,
      title: title.slice(0, 40),
      ok,
    };
  } catch (err) {
    return {
      url,
      status: 'ERR',
      originMatch: false,
      hasNoIndex: false,
      title: err.message,
      ok: false,
    };
  }
}

async function main() {
  console.log(`Checking SEO & Sitemap health at: ${baseUrl}`);
  const requestOrigin = new URL(baseUrl).origin;

  // 1. Fetch robots.txt
  console.log('\n--- Step 1: Checking robots.txt ---');
  try {
    const robotsRes = await fetch(`${baseUrl}/robots.txt`, { redirect: 'manual' });
    console.log(`robots.txt HTTP Status: ${robotsRes.status}`);
    const robotsBody = await robotsRes.text();
    console.log(robotsBody.trim());
  } catch (err) {
    console.error(`Failed to fetch robots.txt: ${err.message}`);
  }

  // 2. Fetch sitemap.xml
  console.log('\n--- Step 2: Fetching and parsing sitemap.xml ---');
  let urls = [];
  try {
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`, { redirect: 'manual' });
    console.log(`sitemap.xml HTTP Status: ${sitemapRes.status}`);
    const sitemapBody = await sitemapRes.text();
    urls = extractLocs(sitemapBody);
    console.log(`Discovered ${urls.length} URLs in sitemap.`);
  } catch (err) {
    console.error(`Failed to fetch sitemap.xml: ${err.message}`);
    process.exit(1);
  }

  if (urls.length === 0) {
    console.warn('Warning: No URLs found in sitemap.xml');
    return;
  }

  // Determine expected canonical origin from sitemap locs
  const sitemapOrigin = urls.length > 0 ? new URL(urls[0]).origin : requestOrigin;
  const isLocal = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1');
  const expectedOrigin = isLocal ? sitemapOrigin : requestOrigin;

  // 3. Inspect each URL sequentially with 300ms pause
  console.log('\n--- Step 3: Checking individual URLs ---');
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] ${u}... `);
    const result = await inspectUrl(u, expectedOrigin, requestOrigin);
    results.push(result);
    console.log(result.ok ? 'OK' : `FAIL (status=${result.status}, noindex=${result.hasNoIndex})`);
    if (i < urls.length - 1) {
      await sleep(300);
    }
  }

  // 4. Output summary table
  console.log('\n--- Summary Table ---');
  console.table(
    results.map((r) => ({
      URL: r.url,
      Status: r.status,
      OriginOK: r.originMatch,
      NoIndex: r.hasNoIndex,
      Pass: r.ok,
    }))
  );

  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    console.error(`\nFound ${failures.length} issues in sitemap inspection.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${results.length} sitemap URLs verified successfully.`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
