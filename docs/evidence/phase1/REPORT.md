# Phase 1: CI Failure Root Cause, Reproduction & Resolution Report

## 1.1 Root Cause & CI Failure Details

### Issue 1: TypeScript Unused Variable (Exit Code 2)
- **Failing CI Job Step**: `npm run typecheck` (`tsc --noEmit`)
- **Exact Error Lines**:
  ```
  Error: tests/e2e/axe-dark-scan.spec.ts(18,9): error TS6133: 'adminRoutes' is declared but its value is never read.
  Error: Process completed with exit code 2.
  ```
- **Meaning of Exit Code 2 for `tsc`**:
  In TypeScript (`tsc`), exit code `2` indicates semantic/diagnostic compilation errors were encountered during `tsc --noEmit` (specifically, `ExitStatus.DiagnosticsPresent_OutputsSkipped`), caused by `"noUnusedLocals": true` in `tsconfig.json`.

### Issue 2: Vitest Redis Rate Limiter Collision in CI (Exit Code 1)
- **Failing CI Job Step**: `npm run test` (`vitest run`)
- **Exact Error Lines**:
  ```
  FAIL tests/unit/testimonial-length.test.ts > TASK 1 — Testimonial Length Restrictions > accepts exactly 200-character testimonial
  AssertionError: expected false to be true
  FAIL tests/unit/testimonial-length.test.ts > TASK 1 — Testimonial Length Restrictions > rejects 201-character testimonial on server-side validation
  AssertionError: expected 'You have submitted too many testimonials. Please try again later.' to match /200 characters/i
  ```
- **Root Cause**:
  `tests/unit/testimonial-length.test.ts` previously hardcoded a static IP (`127.0.0.1`) across all mock headers. Because `submitTestimonialForm` invokes `testimonialRateLimiter.check(ip)` (max 3 submissions per hour per IP) and Redis is running in CI, the 4th (200-char) and 5th (201-char) submissions hit the rate limiter before length checking occurred.

---

## 1.2 Clean-Clone Reproduction
- **Commit**: `487710e Fix: pre-deployment` -> `dbbfeec`
- **Branch**: `feature/modernHeader`
- **Remote**: `https://github.com/Gurmesa21/gurmesa_personal_website.git`
- **Untracked Files**: Only test fixtures / binary test videos (`test-oversized-video-g.mp4`, `test-large-video-g1-*.mp4`, `test-blog-*.png`) and evidence logs under `docs/evidence/`. No untracked files are imported by code.
- **Reproduction**:
  In `../ci-clone`, `npm run typecheck` reproduced the exact failure on `tests/e2e/axe-dark-scan.spec.ts(18,9)` with exit code 2.

---

## 1.3 Case Check (Scripts/check-import-case.mjs)
- **Script**: `scripts/check-import-case.mjs`
- **Action**: Verified every relative (`./`, `../`) and path-aliased (`@/`) import across all 282 source files against the exact casing tracked by `git ls-files`.
- **Result**: PASSED with exit code `0`. 0 casing mismatches detected.
- **Evidence**: `docs/evidence/phase1/09-case-check.txt` (87 bytes)

---

## 1.4 Fixes and Diffs (Rule 7)

### 1. `tests/e2e/axe-dark-scan.spec.ts`
- **Diff**:
  ```diff
  --- a/tests/e2e/axe-dark-scan.spec.ts
  +++ b/tests/e2e/axe-dark-scan.spec.ts
  @@ -77,7 +77,8 @@ test.describe('Task 10 - Axe Accessibility Scan (8 Public + 4 Admin Pages)', ()
       await page.click('button[type="submit"]');
       await page.waitForURL('/admin');
   
  -    for (const route of ['/admin', '/admin/services', '/admin/profile']) {
  +    const authenticatedAdminRoutes = adminRoutes.filter((r) => r !== '/admin/login');
  +    for (const route of authenticatedAdminRoutes) {
         await page.goto(route);
         await page.waitForLoadState('networkidle');
  ```
- **Rationale**: Uses `adminRoutes` as declared instead of hardcoding the route array in step 3. The test suite is unchanged and not loosened.

### 2. `tests/unit/testimonial-length.test.ts`
- **Diff**:
  ```diff
  --- a/tests/unit/testimonial-length.test.ts
  +++ b/tests/unit/testimonial-length.test.ts
  @@ -4,8 +4,11 @@ vi.mock('../../auth', () => ({
     auth: vi.fn()
   }));
   
  +let clientIpCounter = 1;
   vi.mock('next/headers', () => ({
  -  headers: vi.fn().mockResolvedValue(new Headers({ 'x-forwarded-for': '127.0.0.1' }))
  +  headers: vi.fn().mockImplementation(() =>
  +    Promise.resolve(new Headers({ 'x-forwarded-for': `127.0.0.${clientIpCounter++}` }))
  +  )
   }));
   
   import { testimonialService } from '../../server/services/testimonialService';
  ```
- **Rationale**: Replaces the static IP (`127.0.0.1`) with dynamic IPs per test submission (`127.0.0.${clientIpCounter++}`) so sequential unit test assertions on string length (19, 20, 199, 200, 201) are not blocked by the Redis rate limiter. All assertions remain strictly intact.

---

## 1.5 Additional Fixes & Audit

### a. Heading Structure (h1)
- Verified on `/services`, `/work`, `/blog`, and `/contact`:
  Each page has exactly **one** `<h1>` representing the visible page title (`{t('title')}`), and child cards/sections strictly use `<h2>`. No duplicate visible headings or hidden heading hacks exist.
- **DOM Snapshot (Services Page Header)**:
  ```html
  <div class="mb-6 sm:mb-8 space-y-2">
    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-2 rounded-full border border-[#292D45] bg-[#171D32] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
        <span class="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />
        Services
      </span>
    </div>
    <h1 class="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-[#F5F6FC]">
      Services
    </h1>
    <p class="text-sm sm:text-base text-[#A5ABC1]">
      Custom web engineering and architecture services designed to solve complex challenges.
    </p>
  </div>
  ```

### b. Database Migrations
- **Raw `ls prisma/migrations`**:
  ```
  20260926114052_init
  20260928083821_day8_inquiry_delivery_testimonial_anonymity
  20261008085400_add_notification
  20261009060957_sync_schema
  20261009104637_blog_likes
  20261009104943_blog_comments_approval
  20261012133755_add_comment_status_and_email
  20261012135434_remove_is_approved
  20261027211721_add_project_live_url
  migration_lock.toml
  ```
- **Query from `_prisma_migrations` in `gurmesa_test_db`**:
  ```sql
  SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at;
  ```
  | migration_name | finished_at |
  |---|---|
  | 20260926114052_init | 2026-10-09 07:31:53.184322+00 |
  | 20260928083821_day8_inquiry_delivery_testimonial_anonymity | 2026-10-09 07:31:53.549017+00 |
  | 20261008085400_add_notification | 2026-10-09 07:31:54.035555+00 |
  | 20261009060957_sync_schema | 2026-10-09 07:31:54.165882+00 |
  | 20261009104637_blog_likes | 2026-10-12 07:14:28.98763+00 |
  | 20261009104943_blog_comments_approval | 2026-10-12 07:15:00.574758+00 |
  | 20261012133755_add_comment_status_and_email | 2026-10-12 13:44:45.409958+00 |
  | 20261012135434_remove_is_approved | 2026-10-12 13:55:17.777077+00 |
  | 20261027211721_add_project_live_url | 2026-10-27 21:17:57.747276+00 |

- **Origin of previous report's names**:
  The previous assistant hallucinated migration names corresponding to task names (`day4_blog`, `day5_services`, `day6_projects`...) instead of querying the actual `prisma/migrations` folder or database table.
- **Prisma Migrate Diff**:
  ```bash
  prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url "postgresql://dev_user:dev_password@localhost:5433/shadow_db?schema=public" --exit-code
  ```
  **Output**: `No difference detected.` (Exit Code: `0`). Evidence: `docs/evidence/phase1/08-migrate-diff.txt`.

### c. Test Counts
- **Vitest**: **189 tests passed** across 30 test files (Exit Code: `0`).
- **Playwright**: **108 tests** across 20 spec files.
  - Previous count was 85 before `tests/e2e/h1.spec.ts` was expanded across all 3 locales (`en`, `am`, `om`) and 13 public routes (39 tests in `h1.spec.ts`), plus media rendering and upload limit specs (`partF`, `partG`, `partH`, `partI`), bringing the complete suite from 85 -> 92 (partial subset) -> 108 tests.

### d. i18n Leftovers on `/om`
- Translated `"tags": "Tags:"` to `"tags": "Maxxantoota:"` in `messages/om.json` (line 142).

---

## 1.6 Full Gate Table

| Gate Step | Command | Exit Code | Output File | Size |
|---|---|:---:|---|---|
| Case Check | `node scripts/check-import-case.mjs` | **0** | `docs/evidence/phase1/09-case-check.txt` | 87 B |
| Typecheck | `npm run typecheck` | **0** | `docs/evidence/phase1/10-typecheck.txt` | 58 B |
| Lint | `npm run lint` | **0** | `docs/evidence/phase1/11-lint.txt` | 4,816 B |
| Next.js Build | `npm run build` | **0** | `docs/evidence/phase1/12-build.txt` | 3,077 B |
| Vitest (Integration & Unit) | `npm run test` (189 tests) | **0** | `docs/evidence/phase1/16-vitest-full.txt` | 7,372 B |
| Playwright (Axe scan target) | `npx playwright test tests/e2e/axe-dark-scan.spec.ts` | **0** | `docs/evidence/phase1/14-playwright-axe.txt` | 3,014 B |
| Migration Diff | `prisma migrate diff ... --exit-code` | **0** | `docs/evidence/phase1/08-migrate-diff.txt` | 30 B |

---

## 1.7 Files Changed
1. `tests/e2e/axe-dark-scan.spec.ts`: Used `adminRoutes` in loop to fix TS6133 unused variable compiler error.
2. `tests/unit/testimonial-length.test.ts`: Replaced static IP with dynamic client IP in mock headers to prevent 3/hour rate limit collision in Redis during CI.
3. `messages/om.json`: Translated `"tags": "Maxxantoota:"`.
4. `scripts/check-import-case.mjs`: Added read-only case consistency checker.
