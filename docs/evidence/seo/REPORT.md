# Verification Report: Sitemap, Robots.txt, and Search-Indexing Basics

This report documents the implementation, audit findings, test suite results, and verification evidence for making `gurmesa.tech` discoverable and cleanly indexable by Google, Bing, and Edge.

---

## 1. Summary of Changes

All changes were strictly scoped to SEO, sitemap, robots, alternates metadata, and indexing configuration without touching any UI design, components, styling, content, authentication logic, or user data.

1. **Centralized SEO Module (`lib/seo/index.ts`)**:
   - `getBaseUrl()`: Resolves base URL hierarchically (`NEXT_PUBLIC_SITE_URL` -> `SITE_URL` -> `VERCEL_PROJECT_PRODUCTION_URL` / `RENDER_EXTERNAL_URL` -> production default `https://gurmesa.tech` -> non-production `http://localhost:<PORT>`). Trims trailing slashes.
   - `buildAlternates(pathname, locale, overrideCanonical)`: Generates self-referential canonical URLs and hreflang alternate maps for all 3 supported locales (`en` unprefixed root, `am` `/am`, `om` `/om`, plus `x-default` pointing to the English URL).
   - `getVerificationMetadata()`: Exposes Google Search Console (`google`) and Bing Webmaster Tools (`msvalidate.01`) verification tokens if configured in environment variables.

2. **Dynamic Sitemap (`app/sitemap.ts`)**:
   - Implemented using Next.js `MetadataRoute.Sitemap` with ISR cache `export const revalidate = 3600`.
   - Purged on demand when content is updated via `revalidatePublicContent()` in `lib/revalidate.ts`.
   - Generates static entries across all 3 locales: `/`, `/about`, `/services`, `/work`, `/blog`, `/contact`, `/privacy`, `/terms`, `/testimonials`.
   - Generates dynamic entries across all 3 locales for published services, published public/anonymized projects (`/work/[slug]`), and published blog posts (`/blog/[slug]`).
   - Strict confidentiality filtering: excludes private projects (`confidentiality = 'PRIVATE'`) and draft case studies or blog posts.
   - Fault-tolerant data fetching: queries dynamic models with `Promise.allSettled`; if database connectivity is unavailable during build or runtime, falls back gracefully to static routes without failing or returning 500.
   - Deterministic sorting: entries are sorted alphabetically by URL.

3. **Robots Configuration (`app/robots.ts`)**:
   - Production (`APP_ENV=production`): allows `/`, disallows `/admin`, `/api/`, `/api`, `/mock-storage/`, links to `<baseUrl>/sitemap.xml`.
   - Non-production (`APP_ENV !== 'production'`): disallows `/`, `/admin`, `/api/`, `/api`, protecting preview/test environments from indexation while maintaining test suite compatibility.
   - Production guard prevents accidental activation in CI or test suites.

4. **Public Layout & Page Metadata**:
   - Updated `app/[locale]/layout.tsx` to export `metadataBase: new URL(baseUrl)`, verification tokens, and baseline OpenGraph metadata.
   - Updated all public pages (`/`, `/about`, `/services`, `/services/[slug]`, `/work`, `/work/[slug]`, `/blog`, `/blog/[slug]`, `/contact`, `/privacy`, `/terms`, `/testimonials`) to export `generateMetadata` supplying self-referential canonicals and 3-locale hreflang alternates via `buildAlternates`.
   - Verified that admin layout (`app/(admin)/layout.tsx`) maintains `robots: { index: false, follow: false }`.

5. **Crawler Routing Hardening (`proxy.ts`)**:
   - Configured `next-intl/middleware` with `localePrefix: 'as-needed'`.
   - Prevents 307 temporary redirects on default English root URLs (`/`, `/about`, etc.), ensuring search engine bots index pages directly on the canonical URL.

6. **Environment and Operational Documentation**:
   - Updated `.env.production` to point `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, and `AUTH_URL` to `https://gurmesa.tech` (removing legacy placeholder `your-app.onrender.com`).
   - Updated `.env.example` to document `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, and `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
   - Updated `docs/DEPLOYMENT.md` with full environment variable descriptions and resolution rules.
   - Created `docs/SEO.md` with step-by-step instructions for Google Search Console and Bing Webmaster Tools domain verification, sitemap submission, and indexing requests.
   - Created `scripts/check-sitemap.mjs` for automated, non-destructive health checks of `/robots.txt`, `/sitemap.xml`, and individual discovered URLs.

---

## 2. Issues Discovered and Resolved

| File | Line(s) | Prior State / Issue | Resolution |
|---|---|---|---|
| `.env.production` | 21, 23 | `SITE_URL` and `AUTH_URL` pointed to `https://your-app.onrender.com` | Replaced with `https://gurmesa.tech` and added `NEXT_PUBLIC_SITE_URL` |
| `proxy.ts` | 6-9 | Missing `localePrefix: 'as-needed'`, causing 307 redirects for English root routes (`/`, `/about`, etc.) | Added `localePrefix: 'as-needed'` so default English routes respond with 200 OK directly |
| `app/sitemap.ts` | 1-160 | Legacy sitemap had only English routes and threw 500 on database failure | Implemented 3-locale routes, `Promise.allSettled` fallback, and deterministic URL sorting |
| `app/robots.ts` | 1-40 | Hardcoded rules without clear production vs non-production separation | Added `APP_ENV=production` checks, production guard, and explicit sitemap reference |
| `lib/revalidate.ts` | 15 | Purged only individual paths without sitemap | Added `revalidatePath('/sitemap.xml')` to `revalidatePublicContent` |
| Public pages | Various | Pages had missing canonicals or hreflang alternates | Added `generateMetadata` with `buildAlternates` across all public routes |

---

## 3. Verification Gate Results

Each gate command was executed independently with output logged to `docs/evidence/seo/`:

### Gate 1: Linter (`npm run lint`)
- **Command**: `npm run lint`
- **Evidence File**: [`docs/evidence/seo/01-lint.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/seo/01-lint.txt)
- **Result**: `0 errors` (152 pre-existing repo warnings, 0 new warnings). Exit code `0`.

### Gate 2: Typecheck (`npm run typecheck`)
- **Command**: `npm run typecheck`
- **Evidence File**: [`docs/evidence/seo/02-typecheck.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/seo/02-typecheck.txt)
- **Result**: `tsc --noEmit` passed with 0 errors. Exit code `0`.

### Gate 3: Production Build (`npm run build`)
- **Command**: `npm run build`
- **Evidence File**: [`docs/evidence/seo/03-build.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/seo/03-build.txt)
- **Result**: Compiled successfully; generated 32 static pages, `/robots.txt` (static), and `/sitemap.xml` (ISR 1h). Exit code `0`.

### Gate 4: Unit & Integration Tests (`npm run test`)
- **Command**: `npm run test` (Vitest)
- **Evidence File**: [`docs/evidence/seo/04-vitest.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/seo/04-vitest.txt)
- **Result**: `36 passed (36 files)`, `238 passed (238 tests)`. Exit code `0`.
- Includes 7 dedicated unit tests in `tests/unit/seo-sitemap-robots.test.ts` testing base URL resolution, 3-locale hreflang generation, verification tokens, robots production and staging rules, confidentiality exclusion, and database error recovery.

### Gate 5: End-to-End Tests (Playwright Chromium)
Run twice consecutively to ensure test independence and lack of database contamination:
- **Run 1**:
  - **Command**: `npx playwright test tests/e2e/seo-indexing.spec.ts tests/e2e/day10b.spec.ts --project=chromium`
  - **Evidence File**: [`docs/evidence/seo/05-playwright-run1.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/seo/05-playwright-run1.txt)
  - **Result**: `20 passed` (0 failed). Exit code `0`.
- **Run 2**:
  - **Command**: `npx playwright test tests/e2e/seo-indexing.spec.ts tests/e2e/day10b.spec.ts --project=chromium`
  - **Evidence File**: [`docs/evidence/seo/06-playwright-run2.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/seo/06-playwright-run2.txt)
  - **Result**: `20 passed` (0 failed). Exit code `0`.

---

## 4. Production Artifact Verification

### Sample Robots (`docs/evidence/seo/sample-robots.txt`)
```text
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /api
Disallow: /mock-storage/

Sitemap: https://gurmesa.tech/sitemap.xml
```

### Sample Sitemap Snippet (`docs/evidence/seo/sample-sitemap.xml`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>https://gurmesa.tech</loc>
<xhtml:link rel="alternate" hreflang="en" href="https://gurmesa.tech" />
<xhtml:link rel="alternate" hreflang="am" href="https://gurmesa.tech/am" />
<xhtml:link rel="alternate" hreflang="om" href="https://gurmesa.tech/om" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://gurmesa.tech" />
<lastmod>2026-11-04T00:00:00.000Z</lastmod>
<changefreq>weekly</changefreq>
<priority>1</priority>
</url>
...
```

### Sitemap Health Check Script (`docs/evidence/seo/check-sitemap.txt`)
- **Command**: `node scripts/check-sitemap.mjs http://localhost:3006`
- **Result**: All 27 static URLs verified successfully with HTTP 200, matching canonical host, and zero noindex meta or header tags.

---

## 5. Noticed, Not Changed

- In `app/[locale]/layout.tsx`, Google Fonts are imported via `next/font/google` (`Inter`, `Outfit`, `Noto_Sans_Ethiopic`). During production builds in offline or restricted network environments, Next.js retries font downloads before compiling. If offline builds are desired in the future, local font hosting via `@fontsource` can be wired up in a dedicated maintenance cycle.
- In `app/(admin)/admin/media/page.tsx`, line 229 triggers an ESLint warning for `@next/next/no-img-element`. This was left untouched to honor the scope lock.

