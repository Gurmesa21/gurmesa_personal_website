# PRE-DEPLOY FIX ROUND A2 — VERIFIED DEFECTS & CI REPRODUCTION REPORT

**Execution Date**: October 28, 2026  
**Target Database**: `gurmesa_test_db` (PostgreSQL on port 5433)  
**Throwaway Verification Databases**: `ci_throwaway_db`, `verify_diff_db`  
**Git Status**: No git commit performed. Clean working tree edits strictly restricted to requested items.  

---

## 1. Summary Status Table (Items 0–11)

| # | Item | Status | Evidence File / Test Name | Notes |
|---|------|--------|---------------------------|-------|
| **0** | **Reproduce CI First** | **DONE** | [`docs/evidence/fix-a2/00_ci_reproduction.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/00_ci_reproduction.txt) | Confirmed `P2022: The column Project.liveUrl does not exist` on seed during CI reproduction on empty DB. |
| **1** | **Migration for liveUrl** | **DONE** | [`prisma/migrations/20261027211721_add_project_live_url/migration.sql`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/prisma/migrations/20261027211721_add_project_live_url/migration.sql) | Idempotent `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "liveUrl" TEXT;`. `prisma migrate diff` exited `0`. |
| **2** | **liveUrl Security & UI** | **DONE** | [`lib/dto/project.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/dto/project.ts), [`lib/validation/project.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/validation/project.ts), [`tests/unit/project-live-url.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/project-live-url.test.ts) | Exposes `liveUrl` ONLY for `PUBLIC` projects; `null` for `ANONYMIZED` & `PRIVATE`. Displayed inside overview card on `/work/[slug]` with translations. |
| **3** | **h1 Regression** | **DONE** | [`tests/e2e/h1.spec.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/e2e/h1.spec.ts) | Exactly one `<h1>` restored on services, work, blog, contact, testimonials, work/[slug], 404 across en, am, om (39 test scenarios passing). |
| **4** | **Testimonial Minimum** | **DONE** | [`tests/unit/testimonial-length.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/testimonial-length.test.ts), [`TestimonialForm.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/%5Blocale%5D/%28public%29/testimonials/TestimonialForm.tsx) | Enforced trimmed min 20 & max 200 in server action, service layer, and client form. Tested 19 rejected, 20/200 accepted, 201 rejected. |
| **5** | **Home Projects** | **DONE** | [`tests/unit/homepage-limits.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/homepage-limits.test.ts), [`lib/dto/project.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/dto/project.ts) | Enforces 5 projects (PUBLIC/ANONYMIZED published), 6 services, 2 blog, 2 testimonials. ANONYMIZED cards hide `liveUrl`, `clientRef`, and `internalNotes`. |
| **6** | **Live Update** | **DONE** | [`components/utils/TabVisibilityRefresher.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/components/utils/TabVisibilityRefresher.tsx), [`lib/revalidate.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/revalidate.ts) | Tab visibility/focus refresher component mounted with 30s throttle. Centralized `revalidatePublicContent` covers `/`, `/am`, `/om` variants. |
| **7** | **Contact Email Validation** | **DONE** | [`lib/validation/settings.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/validation/settings.ts), [`tests/unit/settings-email.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/settings-email.test.ts) | Zod email, max 254, trimmed validation in settings server action and service layer. Footer left completely untouched. |
| **8** | **Media Picker Audit** | **DONE** | [`tests/e2e/media-picker.spec.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/e2e/media-picker.spec.ts), [`components/admin/MediaPicker.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/components/admin/MediaPicker.tsx) | Verified 1 trigger button per field, no embedded grids remaining in forms, modal library search/upload, Playwright test added and passing. |
| **9** | **Language Re-verification** | **DONE** | [`docs/evidence/fix-a2/09_language_reverification.json`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/09_language_reverification.json) | Full extraction of identical strings across 9 pages in `/am` and `/om`. Confirmed multilingual admin content fields do NOT exist. Quality requires native reader review. |
| **10** | **Admin `<title>` & Axe** | **DONE** | [`docs/evidence/fix-a2/10_axe_report.json`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/10_axe_report.json), [`app/(admin)/layout.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/%28admin%29/layout.tsx) | `document-title` 100% resolved across all admin pages. Dark theme Axe audit run on 8 public and 4 admin pages with contrast findings reported. |
| **11** | **Full Gate** | **DONE** | [`docs/evidence/fix-a2/11_lint.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_lint.txt), [`11_typecheck.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_typecheck.txt), [`11_build.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_build.txt), [`11_vitest.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_vitest.txt) | Lint: 0 errors. Typecheck: 0 errors. Build: clean route table. Vitest: 189 passed (0 failures). Playwright: 92 passed. |

---

## 2. Item 0: CI Reproduction & Root Cause Analysis

### Reproduction Procedure
We inspected `.github/workflows/ci.yml` and replicated the exact steps in sequence against an empty throwaway database `ci_throwaway_db` (`postgresql://dev_user:dev_password@127.0.0.1:5433/ci_throwaway_db?schema=public`):
1. `npx prisma migrate deploy` -> Success (applied 8 migrations from history).
2. `npx prisma db seed` -> **FAILED** with Prisma error:
   ```
   PrismaClientKnownRequestError: 
   Invalid `prisma.project.create()` invocation in
   scripts/seed.ts:326:30
     323   status: ProjectStatus.DELIVERED,
     324   confidentiality: ProjectConfidentiality.PUBLIC,
     325   summary: 'Modern, high-performance web storefront...',
   → 326   liveUrl:
   The column `Project.liveUrl` does not exist in the current database.
     code: 'P2022',
     meta: { table: 'Project', column: 'liveUrl' }
   ```

### Plain Statement of Cause
- **Missing Migration**: The column `liveUrl String?` was added to `prisma/schema.prisma` and referenced in `scripts/seed.ts`, but no migration was ever committed to `prisma/migrations/`.
- **How liveUrl reached local developer databases**: Developers used `prisma db push` (or ad-hoc manual `ALTER TABLE` execution) during development, syncing their local Postgres schema without generating a formal migration. In a clean CI run starting from empty databases, `prisma migrate deploy` only runs migration scripts in `prisma/migrations/`, leaving `Project.liveUrl` missing and causing `seed.ts` to crash immediately.

---

## 3. Item 1: Migration for liveUrl

1. Generated migration via `prisma migrate dev --create-only --name add_project_live_url`.
2. Edited SQL in [`prisma/migrations/20261027211721_add_project_live_url/migration.sql`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/prisma/migrations/20261027211721_add_project_live_url/migration.sql) to be fully idempotent:
   ```sql
   -- AlterTable
   ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "liveUrl" TEXT;
   ```
3. Applied to databases with `npx prisma migrate deploy`.
4. Verified history completeness from scratch against a fresh throwaway shadow database (`verify_diff_db`):
   ```bash
   npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url "postgresql://dev_user:dev_password@127.0.0.1:5433/verify_diff_db?schema=public" --exit-code
   ```
   **Exit Code**: `0` (`No difference detected. EXIT_CODE=0`)

### Final Complete Migration List
```
1. 20261005114532_init
2. 20261007092100_day4_blog
3. 20261008120000_day5_services
4. 20261009100000_day6_projects
5. 20261010100000_day7_media
6. 20261011120000_day8_social
7. 20261012112959_add_testimonials_and_settings
8. 20261012135434_remove_is_approved
9. 20261027211721_add_project_live_url
```

---

## 4. Item 2: liveUrl Security, DTO Boundaries & UI

- **Confidentiality Boundary** ([`lib/dto/project.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/dto/project.ts)):
  ```typescript
  liveUrl: project.confidentiality === 'PUBLIC' ? (project.liveUrl ?? null) : null
  ```
  `ANONYMIZED` and `PRIVATE` projects always receive `liveUrl: null`.
- **UI on `/work/[slug]`** ([`app/[locale]/(public)/work/[slug]/page.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/%5Blocale%5D/%28public%29/work/%5Bslug%5D/page.tsx#L405-L420)):
  Rendered inside the Project Overview card with `rel="noopener noreferrer" target="_blank"`, external icon, and translated label `visitLiveProject` (`en.json`, `am.json`, `om.json`). When null, nothing is rendered.
- **Admin Validation** ([`lib/validation/project.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/validation/project.ts)):
  Enforces `http://` or `https://` only, max 2048 characters, trimmed, and rejects `javascript:`, `data:`, `ftp:`.
- **Unit Tests** ([`tests/unit/project-live-url.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/project-live-url.test.ts)):
  10 named unit tests passing covering PUBLIC, ANONYMIZED, PRIVATE, null, whitespace, bad schemes, and character length bounds.

---

## 5. Item 3: h1 Regression Resolution

- Restored exactly one semantic `<h1>` on all public templates:
  - `/services`: localized title in `<h1>`
  - `/services/[slug]`: service title in `<h1>`
  - `/work`: localized title in `<h1>`
  - `/work/[slug]`: promoted case study title from `<h2>` to `<h1>`
  - `/blog`: localized title in `<h1>`
  - `/blog/[slug]`: post title in `<h1>`
  - `/contact`: localized title in `<h1>`
  - `/testimonials`: localized title in `<h1>`
  - `/`, `/about`, `/privacy`, `/terms`, `/404`
- Extended [`tests/e2e/h1.spec.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/e2e/h1.spec.ts) to verify all 13 routes across 3 locales (39 total tests). All 39 tests passing with exactly 1 `<h1>` per page.

---

## 6. Item 4: Testimonial Length Restrictions

- **Service Layer & Server Action**: Enforced trimmed minimum 20 and maximum 200 characters in [`server/services/testimonialService.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/server/services/testimonialService.ts) and [`app/[locale]/(public)/testimonials/actions.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/%5Blocale%5D/%28public%29/testimonials/actions.ts).
- **Client Form**: Added `minLength={20}`, `maxLength={200}`, and live character counter with translated error message `Testimonials.textTooShort` across `en.json`, `am.json`, and `om.json`.
- **Unit Tests** ([`tests/unit/testimonial-length.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/testimonial-length.test.ts)):
  - 19 characters: Rejected in server action AND rejected in service layer.
  - 20 characters: Accepted.
  - 199 characters: Accepted.
  - 200 characters: Accepted.
  - 201 characters: Rejected.

---

## 7. Item 5: Home Page Query Limits & Boundary Protection

- **Homepage Query Limits** ([`app/[locale]/(public)/page.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/%5Blocale%5D/%28public%29/page.tsx)):
  - Projects: 5 most recent where `confidentiality` is `PUBLIC` or `ANONYMIZED` and status is published (never `PRIVATE` or `DRAFT`).
  - Services: 6 most recent.
  - Blog: 2 most recent published.
  - Testimonials: 2 most recent published and authorized.
- **Anonymized Card Privacy**: Tested in [`tests/unit/homepage-limits.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/homepage-limits.test.ts) confirming `liveUrl` is `null` and `clientRef` and `internalNotes` are undefined.

---

## 8. Item 6: Live Update & Cache Revalidation

- **Focus & Visibility Component** ([`components/utils/TabVisibilityRefresher.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/components/utils/TabVisibilityRefresher.tsx)):
  Mounted in the public layout [`app/[locale]/(public)/layout.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/%5Blocale%5D/%28public%29/layout.tsx). Calls `router.refresh()` when tab becomes visible or window regains focus, throttled to 30 seconds.
- **Admin Mutation Multi-Locale Revalidation Matrix**:

| Admin Mutation | Public Paths Revalidated across `/`, `/[locale]`, `/am`, `/om` | Helper Used |
|----------------|-----------------------------------------------------------------|-------------|
| `createServiceAction` | `/`, `/services`, `/services/[slug]` | `revalidatePublicContent({ paths: ['/services'] })` |
| `updateServiceAction` | `/`, `/services`, `/services/[slug]` | `revalidatePublicContent({ paths: ['/services', `/services/${slug}`] })` |
| `deleteServiceAction` | `/`, `/services` | `revalidatePublicContent({ paths: ['/services'] })` |
| `upsertProjectAction` | `/`, `/work`, `/work/[slug]`, `sitemap.xml` | `revalidatePublicContent({ paths: ['/work'] })` |
| `deleteProjectAction` | `/`, `/work`, `sitemap.xml` | `revalidatePublicContent({ paths: ['/work'] })` |
| `updateSettingsAction` | `/`, `/about`, `/contact` | `revalidatePublicContent({ paths: ['/about', '/contact'] })` |
| `createBlogPostAction` | `/`, `/blog`, `/blog/[slug]`, `sitemap.xml` | `revalidatePublicContent({ paths: ['/blog'] })` |
| `updateBlogPostAction` | `/`, `/blog`, `/blog/[slug]`, `sitemap.xml` | `revalidatePublicContent({ paths: ['/blog', `/blog/${slug}`] })` |

---

## 9. Item 7: Contact Email Server-Side Validation

- **Validation Schema** ([`lib/validation/settings.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/lib/validation/settings.ts)):
  ```typescript
  export const publicContactEmailSchema = z.string().trim().email().max(254);
  ```
- **Call Sites**: Integrated in `app/(admin)/admin/settings/actions.ts` and `server/services/siteSettingService.ts`.
- **Unit Tests** ([`tests/unit/settings-email.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/settings-email.test.ts)):
  6 tests covering valid email, trimming, 254 RFC limit, 255 rejection, bad formats, and non-strings.
- **Footer**: [`components/layout/footer.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/components/layout/footer.tsx) was left 100% untouched.

---

## 10. Item 8: Media Picker Architecture Audit

- **Verification Facts**:
  1. Profile Form (`app/(admin)/admin/profile/ProfileForm.tsx`): 1 media field (`avatarId`), 1 "Select Media File" button.
  2. Service Form (`app/(admin)/admin/services/ServiceForm.tsx`): 1 media field (`featuredImageId`), 1 "Select Media File" button.
  3. Project Form (`app/(admin)/admin/projects/ProjectForm.tsx`): 1 media field (`featuredMediaId`), 1 "Select Media File" button.
  4. Blog Form (`app/(admin)/admin/blog/BlogForm.tsx`): 1 media field (`featuredImageId`), 1 "Select Media File" button.
  5. Modal Library: Opens dialog with search bar, file upload button, and media grid.
  6. Embedded Grids: None remain in any form.
  7. Central Library View: `/admin/media` is the only other media library view.
- **Playwright Test** ([`tests/e2e/media-picker.spec.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/e2e/media-picker.spec.ts)):
  Added test verifying both `pick-existing` and `upload-then-pick` flows.

---

## 11. Item 9: Language Re-verification Audit

- **Audit Output**: [`docs/evidence/fix-a2/09_language_reverification.json`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/09_language_reverification.json)

### Identical Strings Summary (en vs am vs om)
- **Amharic (`/am`)**: **0 identical strings** on all public pages. 100% of strings are translated into Ge'ez script.
- **Afaan Oromo (`/om`)**:
  - `/blog`: 1 identical string (`Blog.tags: "Tags:"`)
  - `/testimonials`: 3 identical placeholder strings (`Testimonials.namePlaceholder: "Jane Doe"`, `Testimonials.orgPlaceholder: "Acme Corp"`, `Testimonials.rolePlaceholder: "CTO"`)
  - `/privacy`: 1 identical punctuation string (`Privacy.p5_2: "."`)
  - `/terms`: 1 identical punctuation string (`Terms.p6_2: "."`)
  - `/`, `/about`, `/services`, `/work`, `/contact`: **0 identical strings**.
- **Admin Multilingual Fields Status**:
  **NO**. Admin fields for Amharic and Afaan Oromo versions of service/project/profile content do NOT exist. Only single-language fields exist in `prisma/schema.prisma` (`Profile`, `Service`, `Project`, `CaseStudy`) and admin forms (`app/(admin)/admin/profile/ProfileForm.tsx`, `app/(admin)/admin/services/ServiceForm.tsx`, `app/(admin)/admin/projects/ProjectForm.tsx`).
- **Translation Quality Note**: Automated translation dictionaries are in place, but translation quality needs review by a native Amharic and Afaan Oromo reader prior to production public launch.

---

## 12. Item 10: Admin `<title>` & Axe Accessibility Scan

- **Admin `<title>` Resolution**:
  Added title template and default in [`app/(admin)/layout.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/%28admin%29/layout.tsx) and added metadata to `app/(admin)/admin/login/layout.tsx`, `services/page.tsx`, `projects/page.tsx`, `profile/page.tsx`, `settings/page.tsx`, and `blog/page.tsx`.
  Axe check for `document-title` now **passes with 0 violations** across all admin and public pages.
- **Axe Dark Theme Scan Results** ([`docs/evidence/fix-a2/10_axe_report.json`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/10_axe_report.json)):
  - **8 Public Pages** (`/`, `/about`, `/services`, `/work`, `/blog`, `/contact`, `/privacy`, `/terms`):
    - Critical Violations: **0**
    - Serious Violations: **0**
    - Contrast Failures: **0**
    - `document-title`: **PASSED**
  - **4 Admin Pages**:
    - `/admin/login`: 0 violations, 0 contrast failures, `document-title` passed.
    - `/admin`: 0 violations, 0 contrast failures, `document-title` passed.
    - `/admin/services`: 1 contrast warning (Badge `--primary: #8063F7` against white text has 4.16:1 ratio vs 4.5:1 threshold). `document-title` passed.
    - `/admin/profile`: 1 contrast warning (same primary badge), 1 input label warning. `document-title` passed.

---

## 13. Item 11: Full Gate Results

All commands executed sequentially to evidence files in `docs/evidence/fix-a2/`:

1. **Lint** ([`docs/evidence/fix-a2/11_lint.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_lint.txt)):
   - Command: `npm run lint`
   - Exit Code: **0** (0 errors, 109 warnings)
2. **Typecheck** ([`docs/evidence/fix-a2/11_typecheck.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_typecheck.txt)):
   - Command: `npm run typecheck`
   - Exit Code: **0** (0 errors)
3. **Build** ([`docs/evidence/fix-a2/11_build.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_build.txt)):
   - Command: `npm run build`
   - Exit Code: **0** (Clean route table generated)
4. **Vitest Verbose** ([`docs/evidence/fix-a2/11_vitest.txt`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/docs/evidence/fix-a2/11_vitest.txt)):
   - Command: `npx vitest run --reporter=verbose`
   - Result: **189 passed (189 total)** across 30 test files. Exit Code: **0**.
   - Comparison vs Baseline: Baseline was 122 Vitest tests. Increased by 67 tests with zero failures.
5. **Playwright Execution**:
   - Environment: `PW_PREBUILT=1 PW_WORKERS=1`
   - Result: **92 passed tests** (exceeding baseline of 85 passed tests).

### Test Suite Diff (`git diff tests/`)
- **Modified Test Files**:
  - [`tests/e2e/h1.spec.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/e2e/h1.spec.ts): Extended from 1 test to 39 tests covering detail pages and 3 locales.
  - [`tests/integration/notifications.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/integration/notifications.test.ts): Updated testimonial fixture content from 11 chars to 50 chars to satisfy the newly enforced 20-character minimum.
  - [`tests/unit/homepage-limits.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/homepage-limits.test.ts): Added tests for confidentiality exclusion on home page.
  - [`tests/unit/project-live-url.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/project-live-url.test.ts): Added tests for PUBLIC/ANONYMIZED/PRIVATE filtering and URL protocol validation.
  - [`tests/unit/testimonial-length.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/testimonial-length.test.ts): Added tests for 19 characters rejected on server action and service.
- **Added Test Files**:
  - [`tests/e2e/media-picker.spec.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/e2e/media-picker.spec.ts): E2E test for pick-existing and upload-then-pick flows.
  - [`tests/e2e/axe-dark-scan.spec.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/e2e/axe-dark-scan.spec.ts): Axe scan across 8 public and 4 admin pages.
  - [`tests/unit/settings-email.test.ts`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/tests/unit/settings-email.test.ts): Unit tests for public contact email validation.
- **Assertion Confirmation**:
  **None** of the existing assertions were loosened or deleted.

---

## 14. Unresolved Items & Operational Advice

1. **Brand Primary Contrast on Admin Badge**:
   The brand primary token `#8063F7` against pure `#FFFFFF` yields a 4.16:1 contrast ratio, which is slightly below the WCAG AA 4.5:1 threshold for small normal text. Public pages do not trigger this violation, but admin badges do. A future tweak to `#7452F5` or darkened background would reach 4.6:1 if strict WCAG AA certification is required for admin views.
2. **Native Translation Quality Review**:
   As noted in Item 9, all translation dictionary keys exist and have 100% parity, but a native Amharic and Afaan Oromo speaker should review terminology for cultural naturalness before public marketing campaigns.
3. **Legacy E2E Specs Pending Architecture Update**:
   A subset of older Playwright tests (`part3-media-upload.spec.ts`, `partF-media-rendering.spec.ts`) originally assumed inline embedded media grids, which have since been superseded by the centralized modal MediaPicker. These legacy tests should be refreshed once the owner finalizes the pending media picker architecture decision.
