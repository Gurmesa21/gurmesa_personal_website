# DAY 15b — PART 7c: STABILIZE PLAYWRIGHT, FIX REAL DEFECTS, INVENTORY THE UNRELEASED SOCIAL WORK

## Summary of Verification
All verification checks passed cleanly with exit code 0:
- **Lint**: 0 errors (79 warnings) -> `docs/evidence/day15b-7c/01-lint.txt`
- **Typecheck**: 0 errors -> `docs/evidence/day15b-7c/02-typecheck.txt`
- **Build**: Success (0 errors) -> `docs/evidence/day15b-7c/03-build.txt`
- **Vitest**: 106/106 passed (19 test files) -> `docs/evidence/day15b-7c/04-vitest.txt`
- **Playwright Run 1**: 84/84 passed (2.2m) -> `docs/evidence/day15b-7c/05-playwright-1.txt`
- **Playwright Run 2**: 84/84 passed (2.1m) -> `docs/evidence/day15b-7c/06-playwright-2.txt`

---

## PART 1 — FAIL FAST (CI and config hygiene)

### 1. Playwright Test Timeout (90000ms)
- **Origin & Reason**: In Day 15a, the test timeout was raised to `90000ms` in `playwright.config.ts` as an ad-hoc workaround for slow test execution and timeouts during single-worker runs on un-seeded or slow environments.
- **Resolution**: Reverted the default timeout back to Playwright's standard default (`30000ms`) in `playwright.config.ts`. No timeouts were raised.

### 2. CI Workflow Configuration (`.github/workflows/ci.yml`)
- Added job level `timeout-minutes: 30`.
- Updated Playwright test command to execute with `--max-failures=5`.
- Confirmed CI explicitly sets `APP_ENV=test` and `PLAYWRIGHT_TEST=1` in its environment configuration.
- Verified that CI does not depend on `.env.test` (which is gitignored); all necessary environment variables for CI are specified inline in `.github/workflows/ci.yml`.

### 3. Screenshot-Capture Specs Isolation
The screenshot-only specs were removed from `tests/e2e/` (which CI runs) and relocated to `tests/screenshots/`:
- `tests/e2e/part1-i18n.spec.ts` -> `tests/screenshots/part1-i18n.spec.ts`
- `tests/e2e/part2a-screenshots.spec.ts` -> `tests/screenshots/part2a-screenshots.spec.ts`
- `tests/e2e/part2b-screenshots.spec.ts` -> `tests/screenshots/part2b-screenshots.spec.ts`
- `tests/e2e/part2c-screenshots.spec.ts` -> `tests/screenshots/part2c-screenshots.spec.ts`
- `tests/e2e/admin-screenshots.spec.ts` -> `tests/screenshots/admin-screenshots.spec.ts`
- `tests/e2e/locale-screenshots.spec.ts` -> `tests/screenshots/locale-screenshots.spec.ts`

These tests are now excluded from the standard test runner (`testDir: './tests/e2e'` in `playwright.config.ts`), saving considerable CI runtime and preventing screenshot capture overhead from affecting test pass/fail metrics.

---

## PART 2 — `/admin/blog` First

### 1. Rendering State in Production Build
When opened against the seeded test database in a production build, `/admin/blog` renders a **table** listing all blog posts.

#### Markup of One List Row
```html
<tr data-testid="admin-row" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
  <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
    Architecting Resilient Distributed Systems
  </td>
  <td class="px-6 py-4">
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
      PUBLISHED
    </span>
  </td>
  <td class="px-6 py-4 text-sm text-slate-500">Oct 09, 2026</td>
  <td class="px-6 py-4 text-sm text-slate-500">Engineering</td>
  <td class="px-6 py-4 text-right space-x-2">
    <a data-testid="edit-link" href="/admin/blog/cm21abcde..." class="text-blue-600 hover:text-blue-800">
      Edit
    </a>
    <button data-testid="delete-btn" class="text-rose-600 hover:text-rose-800">
      Delete
    </button>
  </td>
</tr>
```
- An edit link (`<a href="/admin/blog/[id]">Edit</a>`) exists in each row.

### 2. Stable `data-testid` Hooks
Added stable `data-testid="admin-row"` and `data-testid="edit-link"` hooks across admin table views:
- `app/(admin)/admin/blog/page.tsx`
- `app/(admin)/admin/testimonials/page.tsx`
- `app/(admin)/admin/projects/page.tsx`
- `app/(admin)/admin/services/page.tsx`

Updated `tests/e2e/admin-crud.spec.ts` to locate table items using:
- `page.locator('[data-testid="admin-row"]')`
- `row.locator('[data-testid="edit-link"]')`
Preserving the exact same assertions.

---

## PART 3 — FIX THE REAL DEFECTS

### 1. Single `<h1>` on All Templates
- **Defect**: On `app/[locale]/(public)/page.tsx` (the homepage), the "About Me" section had an `<h1>` tag while the Hero section also had an `<h1>`, creating two `<h1>` elements.
- **Fix**: Changed the About section heading from `<h1>` to `<h2>`.
- **Test Suite**: Added `tests/e2e/h1.spec.ts` testing exactly one `<h1>` per template across all locales (`en`, `am`, `om`) for:
  - Homepage (`/`)
  - About (`/about`)
  - Work (`/work`)
  - Services (`/services`)
  - Blog (`/blog`)
  - Contact (`/contact`)
  All 18 assertions pass.

### 2. Oversized Upload Handling
- **Defect**: Uploading a file > 25MB caused Next.js in production to throw an unhandled server error, resulting in `"Minified React error #441"` in the client console rather than displaying the user-friendly error message.
- **Root Cause**: Next.js App Router masks uncaught Server Action exceptions in production with a sanitized error digest (`NEXT_REDIRECT` or internal server error digest), preventing the error message from reaching the client component.
- **Fix**: Modified `uploadMedia` in `app/(admin)/admin/media/actions.ts` to return structured results:
  ```ts
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'File size exceeds the 25MB limit.' };
  }
  ```
  The UI in `app/(admin)/admin/media/page.tsx` checks `result.ok === false` and renders the error banner with `result.error`.

### 3. Media Rendering Cluster
- **`MediaRenderer.tsx`**:
  - `image/*` -> Next.js `<Image />` component with optimized dimensions.
  - `video/*` -> HTML5 `<video controls />` element.
  - Non-renderable media (e.g. `application/pdf`) -> safe fallback; never passed to Next.js `<Image />`.
- **`MediaPicker.tsx`**:
  - Standardized picker to accept `acceptTypes={['image', 'video']}` by default, preventing PDFs from appearing in avatar, featured image, and gallery selectors. PDFs are permitted only when explicitly requested for resumes.
- **Asset Selection in Tests**:
  - Updated tests in `tests/e2e/partF-media-rendering.spec.ts` and `tests/e2e/part3-media-upload.spec.ts` to target newly uploaded assets by unique name/alt-text rather than using `.first()`, and cleaned up uploaded assets after completion.
- **Public Page Rendering Root Cause**:
  - In `server/services/projectService.ts`, `getAdminProjectById` was missing `media: true` in its Prisma relation query, preventing newly attached featured media from being linked to the project on save.
  - In `partF-media-rendering.spec.ts`, the test was selecting the first project row in admin (`Unpublished Case Study Project`), which is a `DRAFT` project and intentionally not displayed on `/work`. Updated the test to select the published `Caching Fintech` project.

### 4. XSS CaseStudy Test
- Added `data-testid="markdown-content"` to the wrapper in `components/ui/markdown-renderer.tsx`.
- Scoped assertions in `tests/e2e/blog.spec.ts` to `page.locator('[data-testid="markdown-content"]')`, maintaining `not.toContain('<script>')` and zero `<script>` tag assertions.

---

## PART 4 — TEST DATABASE DETERMINISM

### 1. Vitest vs Playwright Databases
- Both Vitest and Playwright use `gurmesa_test_db` on Postgres port 5433.
- They connect to the exact same database.

### 2. Guarding `scripts/seed.ts`
- **Issue**: Previously, importing `scripts/seed.ts` initialized database clients and queries before evaluating the guard, causing the production refusal test to take ~4.6 seconds.
- **Fix**: Placed `guardTestEnvironment()` at the top of `scripts/seed.ts` before any Prisma client instantiation. Nothing runs on import. Vitest guard test execution time dropped to ~1.2s.

### 3. Playwright `globalSetup` (`tests/e2e/global-setup.ts`)
- Configured in `playwright.config.ts`.
- Condition: strictly verifies `process.env.APP_ENV === 'test'` AND database name ends in `_test` or `_test_db`.
- Executes `prisma migrate deploy` and `scripts/seed.ts` deterministically once before tests run.

### 4. Caching Fixture Verification
- Verified that `"Caching Testimonial"` is seeded into `gurmesa_test_db` and available for caching E2E tests.

---

## PART 5 — INVENTORY OF THE UNRELEASED SOCIAL WORK

### 1. Files for Likes, Comments, and Share
- `app/actions/blog.ts` (Server actions for `toggleLike`, `addComment`)
- `components/blog/BlogInteractionButtons.tsx` (Like, Share, and Comment button UI)
- `components/blog/BlogComments.tsx` (Comment list and submission form)
- `server/services/blogService.ts` (`getPublicPostBySlug` with `likedByMe` and comments)
- `server/repositories/blogRepository.ts`
- `lib/dto/blogPost.ts` (`PublicBlogPost` DTO with `likesCount`, `likedByMe`, `comments`)
- `lib/rate-limit/index.ts` (`BlogLikeRateLimiter`, `CommentRateLimiter`)
- `lib/notifications/index.ts` (`NEW_COMMENT` notification trigger)
- `lib/audit/index.ts` (Admin audit logging)
- `tests/integration/blog-likes.test.ts`
- `tests/e2e/partI-blog-social.spec.ts`

### 2. Migrations Created on 2026-10-09
1. `20261009134600_add_blog_likes`:
```sql
CREATE TABLE "BlogLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogLike_postId_voterHash_key" ON "BlogLike"("postId", "voterHash");

ALTER TABLE "BlogLike" ADD CONSTRAINT "BlogLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

2. `20261009134900_add_blog_comments`:
```sql
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 3. Specification Compliance Matrix
| Feature | Status | Notes |
|---|---|---|
| `BlogLike` with `voterHash` | **BUILT** | Unique index on `(postId, voterHash)` with HMAC hash of IP + User-Agent |
| `BlogComment` status enum | **PARTIAL** | Implemented using boolean `isApproved` instead of dedicated `CommentStatus` enum |
| Honeypot | **BUILT** | Input present on comment form, rejected if filled |
| Rate limit | **BUILT** | `BlogLikeRateLimiter` (10/min) and `CommentRateLimiter` (5/hr) in `lib/rate-limit` |
| Admin comments queue (`/admin/comments`) | **MISSING** | Route and review UI not built in App Router |
| Audit log | **BUILT** | `logAdminAction` called on post/comment admin modifications |
| `NEW_COMMENT` notification | **BUILT** | `createNotification` called with `NEW_COMMENT` type on submission |
| Share | **BUILT** | Web Share API (`navigator.share`) with fallback clipboard copy |

---

## PART 6 — MIGRATIONS AND STORAGE

### 1. `_prisma_migrations` Table State
The `_prisma_migrations` table contains 6 records:
1. `20261001000000_init`
2. `20261003120000_add_profile_seo`
3. `20261005100000_add_media_asset`
4. `20261007000000_add_audit_and_notifications`
5. `20261009134600_add_blog_likes`
6. `20261009134900_add_blog_comments`

#### Why Oct 5 avatar and service-image migrations no longer exist:
Earlier prototype migrations were consolidated into `20261005100000_add_media_asset` which introduced polymorphic media references (`avatarId`, `featuredImageId`). The test database was reset with `prisma migrate reset`. `prisma db push` was not used for production schema changes; all changes go through versioned migrations.

### 2. Local Storage Adapter & Turbopack
- **`lib/storage/local.ts`**: Introduced for local development and CI testing to enable file uploads without live S3/Cloudflare R2 credentials. Active only when `STORAGE_PROVIDER === 'local'` or in test/development environments when S3 credentials are unset. Production requires S3/R2 storage adapter.
- **Turbopack Tracing Fix**: Fixed whole-project file tracing by scoping local storage file operations strictly to `process.cwd()/public/uploads` and configuring `outputFileTracingIncludes` in `next.config.ts`.
- **`app/mock-storage/icon.jpg`**: Removed unused static mock asset from public routing.

---

## PART 7 — VERIFICATION RESULTS

### Commands Run (one at a time)
1. `npm run lint 2>&1 | Out-File -Encoding utf8 docs/evidence/day15b-7c/01-lint.txt` (Exit code: 0)
2. `npm run typecheck 2>&1 | Out-File -Encoding utf8 docs/evidence/day15b-7c/02-typecheck.txt` (Exit code: 0)
3. `npm run build 2>&1 | Out-File -Encoding utf8 docs/evidence/day15b-7c/03-build.txt` (Exit code: 0)
4. `npm run test 2>&1 | Out-File -Encoding utf8 docs/evidence/day15b-7c/04-vitest.txt` (Exit code: 0, 106/106 passed)
5. `PW_PREBUILT=1 PW_WORKERS=1 npx playwright test` -> `docs/evidence/day15b-7c/05-playwright-1.txt` (Exit code: 0, 84/84 passed)
6. `PW_PREBUILT=1 PW_WORKERS=1 npx playwright test` -> `docs/evidence/day15b-7c/06-playwright-2.txt` (Exit code: 0, 84/84 passed)

### Remaining Failures Table
| Test | Cause | Class |
|---|---|---|
| *None* | *None* | *All tests passed* |

Both Playwright runs passed in full (84/84 tests each).
