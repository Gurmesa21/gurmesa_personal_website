# SEO & Search Indexing Inspection Report (Step 0)

Date: November 7, 2026
Target: gurmesa.tech (AVENOR Portfolio)

---

## 1. Existing Assets & Metadata Exports

### Sitemap & Robots Files
- `app/sitemap.ts`: Exists (`MetadataRoute.Sitemap`), but only outputs English unprefixed routes, omits `/testimonials`, does not provide `alternates.languages` (hreflang), does not filter projects by confidentiality (`PUBLIC` / `ANONYMIZED`), uses dynamic `new Date()` for all static routes, and lacks database error fallback handling.
- `app/robots.ts`: Exists (`MetadataRoute.Robots`), allows `/` and disallows `/admin` and `/api`, but does not inspect `APP_ENV` to enforce `disallow: /` in non-production environments (test, staging, preview).
- `public/robots.txt`: Does not exist (handled via `app/robots.ts`).
- `public/sitemap*.xml`: Does not exist (handled via `app/sitemap.ts`).

### Metadata Exports in Layouts & Pages
- `app/[locale]/layout.tsx`:
  - Line 19: `metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000')` (falls back to localhost).
  - Lines 25-30: Contains basic `openGraph` with `/og-image.jpg` and `twitter: { card: 'summary_large_image' }`.
- `app/(admin)/layout.tsx`:
  - Line 15: `robots: { index: false, follow: false }` properly set.
- Public Pages:
  - `app/[locale]/(public)/page.tsx` (lines 131-145): `generateMetadata` exports `title`, `description`, `alternates.canonical` (English only, ignores current locale), and `openGraph`.
  - `app/[locale]/(public)/about/page.tsx` (lines 62-76): `generateMetadata` exports `alternates.canonical` (English only).
  - `app/[locale]/(public)/blog/page.tsx` (lines 22-35): `generateMetadata` exports `alternates.canonical` (English only).
  - `app/[locale]/(public)/blog/[slug]/page.tsx` (lines 17-33): `generateMetadata` exports `alternates.canonical` (English only).
  - `app/[locale]/(public)/services/page.tsx` (lines 27-40): `generateMetadata` exports `alternates.canonical` (English only).
  - `app/[locale]/(public)/services/[slug]/page.tsx` (lines 27-43): `generateMetadata` exports `alternates.canonical` (English only).
  - `app/[locale]/(public)/work/page.tsx` (lines 20-33): `generateMetadata` exports `alternates.canonical` (English only).
  - `app/[locale]/(public)/work/[slug]/page.tsx` (lines 26-44): `generateMetadata` exports `alternates.canonical` (English only).
  - `app/[locale]/(public)/contact/page.tsx` (lines 17-20): Static metadata with `title` and `description` only; lacks `alternates.canonical`, `alternates.languages`, and `openGraph`.
  - `app/[locale]/(public)/testimonials/page.tsx` (lines 17-20): Static metadata with `title` and `description` only; lacks `alternates.canonical`, `alternates.languages`, and `openGraph`.
  - `app/[locale]/(public)/privacy/page.tsx` (lines 15-17): Static metadata with `title` only; lacks `alternates.canonical`, `alternates.languages`, and `openGraph`.
  - `app/[locale]/(public)/terms/page.tsx` (lines 13-15): Static metadata with `title` only; lacks `alternates.canonical`, `alternates.languages`, and `openGraph`.
- Public Pages `robots`:
  - None of the public pages have `noindex` or `robots: { index: false }`. All default to indexable.

### Middleware & Headers Inspection
- `next.config.ts` (lines 40-77):
  - Injects security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy`, `Content-Security-Policy`, and production `Strict-Transport-Security`.
  - **No `X-Robots-Tag` header** is present.
- `proxy.ts`:
  - Line 49: Matcher excludes `robots\.txt` and `sitemap\.xml` via negative lookahead.
  - Lines 40-42: Explicitly passes through `/robots.txt` and `/sitemap.xml` without rewriting or locale redirect.

---

## 2. Issues Blocking or Hurting Indexing in Production

1. **Missing or Inaccurate Fallback Base URL**:
   - `app/[locale]/layout.tsx:19`, `app/robots.ts:4`, `app/sitemap.ts:9`, and page `generateMetadata` calls fall back to `'http://localhost:3000'`.
   - `.env.production:21` has placeholder `SITE_URL="https://your-app.onrender.com"`.
   - When deployed without an explicit `SITE_URL` or `NEXT_PUBLIC_SITE_URL`, canonical URLs and sitemaps point to localhost or onrender.
   - **Resolution**: Introduce centralized `getBaseUrl()` helper resolving `process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://gurmesa.tech'` with no trailing slash.

2. **Incomplete Robots Environment Separation**:
   - `app/robots.ts:7-11`: Emits `allow: '/'` in all environments.
   - In non-production environments (preview, staging, test), search engines should be barred from indexing (`disallow: '/'`).
   - In production (`APP_ENV=production`), `allow: '/'` and `disallow: ['/admin', '/api']` should be emitted, with link to `<baseUrl>/sitemap.xml`.

3. **Incomplete Sitemap Coverage & Locales**:
   - `app/sitemap.ts`:
     - Missing all Amharic (`/am`) and Afaan Oromo (`/om`) alternate URLs.
     - Missing `/testimonials`.
     - Missing `alternates.languages` (hreflang) with `en`, `am`, `om`, and `x-default`.
     - Project queries do not filter for `PUBLIC` / `ANONYMIZED` confidentiality (risking indexing of `PRIVATE` projects).
     - Static pages use `new Date()` on each invocation instead of fixed/build timestamps.
     - Missing graceful fallback to static routes if database connection fails.
     - Lacks cache revalidation coordination with `revalidatePublicContent`.

4. **Missing Canonical & Hreflang on Key Public Pages**:
   - `/contact`, `/testimonials`, `/privacy`, `/terms` lack canonical URLs and language alternates.
   - `/`, `/about`, `/services`, `/work`, `/blog` have canonical URLs that hardcode English without locale prefixes when viewed in `/am` or `/om`, and lack `alternates.languages`.

5. **Search Engine Verification Support**:
   - No mechanism currently reads Google or Bing site verification tokens from environment variables.

---

## 3. Locale Routing & Middleware Matcher Validation

- **Routing Structure**:
  - English: Unprefixed (`/`, `/about`, `/services`, `/work`, `/blog`, `/contact`, `/testimonials`, `/privacy`, `/terms`).
  - Amharic: Prefixed `/am` (`/am`, `/am/about`, etc.).
  - Afaan Oromo: Prefixed `/om` (`/om`, `/om/about`, etc.).
- **Middleware (`proxy.ts`)**:
  - `matcher` config safely ignores `robots.txt` and `sitemap.xml`.
  - Pass-through logic on lines 40-42 guarantees neither file is intercepted or rewritten to `/en/*`.

---

## 4. Site URL Source & Configuration Plan

- Environment variable precedence:
  1. `process.env.NEXT_PUBLIC_SITE_URL`
  2. `process.env.SITE_URL`
  3. Default fallback: `https://gurmesa.tech`
- Sanitization: Strip any trailing slash (`.replace(/\/+$/, '')`).
- Document `NEXT_PUBLIC_SITE_URL` in `.env.example` and `docs/DEPLOYMENT.md`.

