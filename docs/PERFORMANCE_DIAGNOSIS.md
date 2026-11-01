# Performance Diagnosis & Baseline Analysis

## 1. Architectural & Code-Level Inspection (Phase A1)

### a. How Uploaded Videos and Images Reach the Browser
- **Code locations**:
  - `lib/storage/s3.ts:98-114`: `getUrl(key)` checks `STORAGE_PUBLIC_URL`. If empty, it calls AWS SDK `getSignedUrl` to generate a temporary presigned URL (`X-Amz-Expires=604800`).
  - `components/ui/MediaRenderer.tsx:23-35`: For videos, the direct/presigned S3 URL is rendered directly inside `<video><source src={url} type={videoMime} /></video>`. Browser directly requests the video file from the storage host.
  - `components/ui/MediaRenderer.tsx:38-51`: For images, `MediaRenderer` renders Next.js `<Image src={url} ... />` **without** `unoptimized={true}`. As a result, the browser does NOT fetch images directly from storage; instead, the browser calls the Next.js server route `/_next/image?url=<encoded-storage-url>&w=...&q=...`. The Next.js server on Render downloads the original asset from Neon/S3 storage, resizes it on CPU, and streams it to the client.

### b. Video Attributes and Simultaneous Video Load Count
- **MediaRenderer Video Attributes** (`components/ui/MediaRenderer.tsx:23-31`):
  - `controls`: Present (`true`, line 25)
  - `muted`: Present (`true`, line 26)
  - `playsInline`: Present (`true`, line 27)
  - `autoPlay`: Present (`true`, line 28)
  - `loop`: Present (`true`, line 29)
  - `preload`: `"metadata"` (line 30)
  - `poster`: Absent (none provided)
- **Work Page Card Video Attributes** (`app/[locale]/(public)/work/page.tsx:214-221`):
  - In addition to `MediaRenderer`, `work/page.tsx` renders raw inline `<video autoPlay loop muted playsInline />` with **no `preload` attribute** (browser defaults to full or aggressive buffering) and **no IntersectionObserver**.
- **Simultaneous `<video>` elements per page**:
  - `/` (Home): Up to 14 videos simultaneously (1 avatar + 5 projects + 6 services + 2 blog posts).
  - `/work`: All public projects are rendered simultaneously with no pagination (`app/[locale]/(public)/work/page.tsx:102`). If 10 projects have videos, all 10 `<video autoPlay>` elements load and buffer simultaneously on page mount.
  - `/services`: All published services are rendered (`app/[locale]/(public)/services/page.tsx:55`). If 6 services have videos, 6 videos load.
  - `/services/[slug]` and `/work/[slug]`: 1 featured banner video + any gallery videos.

### c. How Storage-Hosted Images Use next/image
- **Code location**: `components/ui/MediaRenderer.tsx:38-51`
  - `loader`: Default internal Next.js loader (none configured).
  - `sizes`: In fill mode, `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` (line 45); in width/height mode, no sizes specified.
  - `priority`: Absent (defaults to `false` / lazy loading).
  - `unoptimized`: Absent (`false`), forcing all images through `/_next/image` proxy transformation on Render's single-instance CPU.

### d. Upload Metadata (PutObject)
- **Code location**: `lib/storage/s3.ts:72-77`
  ```ts
  const command = new PutObjectCommand({
    Bucket: this.bucket,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });
  ```
  - `ContentType`: Present (`file.type`, line 76).
  - `CacheControl`: **Absent** (`undefined`). S3/Neon storage serves objects without `Cache-Control: public, max-age=31536000, immutable`, preventing browsers and intermediate CDNs from caching media assets permanently.

### e. Dynamic Routes and Causes
All public routes currently export `dynamic = 'force-dynamic'`, completely disabling Next.js Full Route Cache and ISR:
1. `app/[locale]/(public)/page.tsx:121`: `export const dynamic = 'force-dynamic';`, plus checks `searchParams` (lines 139-142).
2. `app/[locale]/(public)/services/page.tsx:2`: `export const dynamic = 'force-dynamic';`.
3. `app/[locale]/(public)/services/[slug]/page.tsx:1`: `export const dynamic = 'force-dynamic';`.
4. `app/[locale]/(public)/work/page.tsx:12`: `export const dynamic = 'force-dynamic';`, plus consumes `searchParams` for tag filtering (lines 96-98).
5. `app/[locale]/(public)/work/[slug]/page.tsx:21`: `export const dynamic = 'force-dynamic';`.
6. `app/[locale]/(public)/blog/page.tsx:13`: `export const dynamic = 'force-dynamic';`, plus consumes `searchParams` (lines 30-37).
7. `app/[locale]/(public)/blog/[slug]/page.tsx:12`: `export const dynamic = 'force-dynamic';`.
8. `app/[locale]/(public)/about/page.tsx:2`: `export const dynamic = 'force-dynamic';`.
9. `server/services/blogService.ts:15-25`: `getCurrentVoterHash()` calls `await headers()` to inspect IP and User-Agent on every post fetch, turning post queries into dynamic per-request calls.

### f. Database Work per Public Page
- **Sequential Awaits & N+1 Queries**:
  - Home Page (`app/[locale]/(public)/page.tsx:151-170`): 8 sequential awaits (`getTranslations`, `getPublicProfile`, `getPublicSocialLinks`, `getResumeUrl`, `getPublicServices`, `getPublicProjects`, `getPublicPosts`, `getPublicTestimonials`).
  - Home Page N+1 Media Queries (`page.tsx:181-226`): Runs 5 individual `prisma.projectMedia.findFirst` queries + 6 individual `prisma.mediaAsset.findUnique` queries inside `Promise.all` loops instead of joining or batch-querying with the parent models.
  - Work Page (`app/[locale]/(public)/work/page.tsx:121-136`): Maps over all projects executing individual `prisma.projectMedia.findFirst` for each project.
  - Service Detail (`app/[locale]/(public)/services/[slug]/page.tsx:64-68`): Executes extra sequential `prisma.mediaAsset.findUnique` query.
- **Columns Selected**:
  - `projectService.ts:18-33`: `include: { caseStudy: true, technologies: { include: { technology: true } } }` retrieves all columns (including large `internalNotes` and case study bodies) when only summaries and titles are needed for cards.
- **Per-Item Presigned URL Generation**:
  - When `STORAGE_PUBLIC_URL` is omitted, `s3.ts:109-113` runs crypto-heavy HMAC SHA256 signing for every single media item on every page render.
- **Missing Database Indexes in schema.prisma**:
  - `Testimonial` (`prisma/schema.prisma:342-352`): Zero indexes. Missing index on `[status, permissionStatus, createdAt]`.
  - `Service` (`prisma/schema.prisma:170-187`): Missing index on `[status, order]` or `[status, createdAt]`.
  - `Project` (`prisma/schema.prisma:189-210`): Missing composite index on `[status, confidentiality, createdAt]`.
  - `ProjectMedia` (`prisma/schema.prisma:251-261`): Missing composite index on `[projectId, order]`.

### g. Render & Neon Regions and /api/health
- **Render Service Region**: `Ohio (US East)` (`us-east`).
- **Neon Postgres Region**: `us-east-2` (AWS Ohio, endpoint host `ep-raspy-mountain-b5ay6qa3.c-7.us-east-2.aws.neon.tech`). Both services are co-located in Ohio.
- **What `/api/health` queries**: `app/api/health/route.ts:17` executes a lightweight `SELECT 1` query via `prisma.$queryRaw\`SELECT 1\``.
- **Neon Free-Plan Limits**:
  - Neon Free Tier grants **100 compute hours per month** with an idle auto-suspend timer (typically 5 minutes).
  - Pinging `/api/health` every 5 minutes 24/7 (720 hours/month) would keep Neon compute awake constantly, consuming 720 compute hours and exceeding the 100-hour allowance. An uptime ping frequency of every 15-20 minutes, or purchasing a basic compute plan, is recommended if 24/7 warm state is required without suspension.

### h. next.config Configuration
- **Output Mode**: Default server mode (`outputFileTracingRoot: path.resolve(__dirname)`).
- **Compression**: Default Next.js gzip/brotli enabled.
- **Images**: `remotePatterns` configured for `*.neon.tech` and wildcards; no custom sizes or SVG bypass.
- **Headers**: Full security headers configured (CSP, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, X-Frame-Options).

---

## 2. Live Baseline Measurements (Phase A2)

Extracted from live runs against `https://gurmesa-personal-website.onrender.com` recorded in `docs/evidence/perf/00-baseline.txt`:

| Page / Asset | Cold TTFB | Cold Total | Warm TTFB (Avg) | Warm Total (Avg) | Size | Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`/` (Home)** | 0.832s | 1.604s | 1.341s | 1.720s | 156 KB | 8 sequential DB queries + N+1 media queries |
| **`/services`** | 2.097s | 2.205s | 0.630s | 1.047s | 75 KB | Cold startup ~2.2s; warm ~1s |
| **First `/services/<slug>`** | 0.611s | 1.137s | 2.091s | 2.286s | 72 KB | Variance due to un-cached DB lookup |
| **`/work`** | 0.625s | 0.666s | 0.570s | 0.672s | 96 KB | Loads all project cards |
| **First `/work/<slug>`** | 1.070s | 1.443s | 0.514s | 0.616s | 77 KB | Case study detail |
| **First Video URL** | **9.461s** | **81.054s** | **3.713s** | **35.358s** | 642 KB | **CRITICAL BOTTLENECK**: Neon S3 storage handshake & presigned streaming takes 28-81s |
| **First Image URL** | **1.991s** | **6.343s** | **2.283s** | **14.246s** | 167 KB | S3 presigned asset fetch latency |

---

## 3. Ranked Causes & Action Plan (Phase A3)

| Rank | Cause | Status | Evidence | Expected Gain | Planned Change |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **1** | **Direct Presigned Media Streaming & Unbuffered Videos** | **CONFIRMED** | `docs/evidence/perf/00-baseline.txt` shows video takes 28s-81s total download time. `MediaRenderer.tsx:28` has `autoPlay`, and `work/page.tsx:214` has unconstrained `<video autoPlay>`. | **-90% data transfer and CPU load on mount** | Replace card autoplay with `preload="metadata"` and an `IntersectionObserver` that only plays when in viewport and pauses when leaving; render consistent 16:9 box; max 1280 wide; unoptimized next/image for images. |
| **2** | **Force-Dynamic Public Pages (No Caching / No ISR)** | **CONFIRMED** | `dynamic = 'force-dynamic'` in `page.tsx:121`, `services/page.tsx:2`, `work/page.tsx:12`, `about/page.tsx:2`. Every request re-executes all SQL queries. | **TTFB drops from ~1200ms to <150ms** | Switch public pages to cached pages with background revalidation (e.g. `revalidate = 60`) + on-demand revalidation on admin mutations. Keep test-mode dynamic via `isTestMode()`. |
| **3** | **Missing PutObject Cache-Control Headers** | **CONFIRMED** | `lib/storage/s3.ts:72-77` omits `CacheControl`. Assets are re-downloaded repeatedly. | **100% browser cache hits on repeat visits** | Set `CacheControl: 'public, max-age=31536000, immutable'` on PutObject. Add script to update existing headers if supported. |
| **4** | **N+1 Database Queries & Sequential Awaits** | **CONFIRMED** | `page.tsx:151-170` (8 sequential awaits) and lines `181-226` (N+1 queries for projectMedia and mediaAsset). | **-60% DB query latency on cache misses** | Parallelize independent queries with `Promise.all`; include media relations directly in parent queries (`include: { media: true }`). |
| **5** | **Missing Composite Database Indexes** | **CONFIRMED** | `schema.prisma` lacks indexes on `Testimonial`, `Service[status, order]`, `ProjectMedia[projectId, order]`. | **Sub-millisecond query execution on Postgres** | Add missing indexes via an additive `prisma migrate dev` migration. |
| **6** | **Dynamic Headers Call in Blog Service (`likedByMe`)** | **CONFIRMED** | `blogService.ts:15-25` calls `await headers()` to calculate visitor HMAC voterHash on server render. | **Enables static/ISR caching for `/blog`** | Move `likedByMe` check to a lightweight client-side fetch or cookie-based state. |
