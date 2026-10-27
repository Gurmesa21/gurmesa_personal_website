# PRE-DEPLOY VERIFICATION AUDIT REPORT — 11 OWNER-REQUESTED ITEMS

**Audit Mode**: Read-Only Audit (No fixes or modifications applied)  
**Database**: `gurmesa_test_db` (PostgreSQL on port 5433)  
**Branch**: `feature/modernHeader` (Tracking: `origin/feature/modernHeader`)  
**Commit**: `51a1607` (All 15 commits pushed to remote)  
**Working Directory**: Contains uncommitted implementation changes under review  

---

## 1. Executive Summary & Verification Matrix

| # | Item | Claim | Evidence (File / Test) | Verdict |
|---|------|-------|------------------------|---------|
| **0** | **State** | Clean branch tracking, migrations up to date, commit state reported | `00_git_status.txt` (3,275 B), `00_prisma_migrate_status.txt` (261 B) | **VERIFIED** |
| **1** | **Testimonial Length** | Min 20, max 200 chars enforced with Zod schema, form attributes, counter, 19 rejected, 20/200 accepted, 201 rejected | `tests/unit/testimonial-length.test.ts`, `TestimonialForm.tsx:129`, `actions.ts:38` | **PARTIAL** |
| **2** | **Project Link** | Live project URL migration, admin input, safe protocol validation, display in overview card on `/work/[slug]`, confidentiality filtering | `ProjectForm.tsx:35-43`, `tests/unit/project-live-url.test.ts`, `schema.prisma:199` | **FAIL** |
| **3** | **Audit Log Page** | Admin sidebar & dashboard links, auth guard, pagination, filters, 8 mutation audit rows | `03_audit_mutations.txt` (3,517 B), `layout.tsx:45`, `admin/page.tsx:24` | **VERIFIED** |
| **4** | **Home Limits** | Exactly 6 services, 5 public projects, 2 blog posts, 2 testimonials, most recent first, drafts/private/anonymized excluded | `page.tsx:166-176`, `tests/unit/homepage-limits.test.ts`, `projectService.ts:19` | **PARTIAL** |
| **5** | **Contact Email** | No demo/example email hardcoding, admin settings field, visible on contact & footer, invalid rejected, unset hides | `05_email_grep.txt` (1,306 B), `05_email_grep.json` (2,257 B), `footer.tsx` | **PARTIAL** |
| **6** | **Live Update** | Cache revalidation covers locales, focus/visibility refresh component updates open tabs | `services/actions.ts:61-68` | **PARTIAL** |
| **7** | **Read Time** | Canonical calculation helper, both call sites, consistent minutes for short (<200w) and long (>1000w) posts | `lib/reading-time.ts`, `tests/unit/reading-time.test.ts` (5 passed) | **VERIFIED** |
| **8** | **Media Library Flow** | Modal picker vs URL navigation, embedded media grids removed, `/admin/media` centralized | `MediaPicker.tsx`, `tests/unit/infrastructure-media-service.test.ts` | **PARTIAL** |
| **9** | **Language & Parity** | 100% key parity across en/am/om, identical chrome audit, fallback logic | `tests/unit/translations-parity.test.ts`, `09_identical_translations.json` | **VERIFIED** |
| **10** | **Privacy / Terms** | Testimonials card removed from `/privacy` and `/terms`, preserved on `/` | `tests/unit/legal-pages-testimonials.test.ts` (3 passed), `page.tsx:170` | **VERIFIED** |
| **11** | **Dark Theme Only** | Permanent dark mode, no theme toggle/localStorage, server dark class, token contrast | `tests/unit/theme-dark-permanent.test.ts` (4 passed), `globals.css` | **VERIFIED** |
| **12** | **Full Gate** | Sequential execution: lint, typecheck, build, vitest, playwright | `12_lint.txt` (15 KB), `12_typecheck.txt` (58 B), `12_build.txt` (3 KB), `12_vitest.txt` (38 KB) | **PARTIAL** |

### Summary Totals
- **VERIFIED**: 6 items (Item 0, Item 3, Item 7, Item 9, Item 10, Item 11)
- **PARTIAL**: 6 items (Item 1, Item 4, Item 5, Item 6, Item 8, Item 12)
- **FAIL**: 1 item (Item 2)
- **UNVERIFIED**: 0 items

---

## 2. Item-by-Item Detailed Audit Findings

### Item 0: Repository State
- **Branch**: `feature/modernHeader` tracking `origin/feature/modernHeader`.
- **Commit History**: Last 15 commits pushed to remote; HEAD is `51a1607 fix: Fixing the blog page build bug`.
- **Working Tree**: 38 modified files, 17 untracked files (`00_git_status.txt`).
- **Prisma Migrations**: 8 applied migrations in `prisma/migrations`.
- **Migrations added since `20261012135434_remove_is_approved`**: **NONE**. No new migration files exist.

### Item 1: Testimonial Length Restrictions
- **Zod Schema**: Not implemented. Validations are handled via ad-hoc procedural `if` conditions.
- **Form Attributes**: `maxLength={200}` is set on `<Textarea id="text">`, but **`minLength={20}` is missing**.
- **Counter**: Visual character counter `{text.length} / 200` operates in `TestimonialForm.tsx:129`.
- **Validation Tests**:
  - `20 chars`: Accepted (`tests/unit/testimonial-length.test.ts`).
  - `200 chars`: Accepted (`tests/unit/testimonial-length.test.ts`).
  - `201 chars`: Rejected on client and server (`tests/unit/testimonial-length.test.ts`).
  - `19 chars`: **DEFECT**. Neither `actions.ts` nor `testimonialService.ts` checks minimum length (20). Submitting 19 characters succeeds.
- **Translations**: `Testimonials.textTooLong` translated across `en`, `am`, and `om`.

### Item 2: Project Link & Confidentiality Boundary
- **Database Migration**: **DEFECT**. `liveUrl String?` was added to `prisma/schema.prisma` without generating a migration in `prisma/migrations/`.
- **Admin Field**: Present in `app/(admin)/admin/projects/ProjectForm.tsx:35-43` with `validateLiveUrl` checking for `http://` and `https://`.
- **Work Page Display**: **DEFECT**. Neither `liveUrl` nor `projectUrl` is rendered in `app/[locale]/(public)/work/[slug]/page.tsx`. The project overview card omits the link entirely.
- **Confidentiality Leaking**: **DEFECT**. `lib/dto/project.ts:56` maps `liveUrl: project.liveUrl ?? null` unconditionally. When a project is marked `ANONYMIZED`, `liveUrl` remains present in the DTO instead of being scrubbed.

### Item 3: Audit Log Page & Mutations
- **Navigation Links**:
  - Sidebar: `app/(admin)/layout.tsx:45`
  - Dashboard Quick Link: `app/(admin)/admin/page.tsx:24`
- **Security & Authorization**: Unauthenticated visits to `/admin/audit-log` redirect to `/admin/login` (`app/(admin)/admin/audit-log/page.tsx:39`).
- **Pagination & Filters**: Server-side filtering by actor search (`q`), `action`, and `entity` with 20 items per page.
- **Mutations Verified on `gurmesa_test_db`** (`03_audit_mutations.txt`):
  1. Profile Edit (`UPDATE Profile`)
  2. Service Edit (`UPDATE Service`)
  3. Project Edit (`UPDATE Project`)
  4. Media Upload (`CREATE MediaAsset`)
  5. Media Delete (`DELETE MediaAsset`)
  6. Comment Approve (`APPROVE BlogComment`)
  7. Settings Change (`UPDATE SiteSetting`)
  8. Login (`LOGIN AdminUser`)

### Item 4: Homepage Query Limits
- **Limits Enforced**:
  - Services: `take: 6`, `orderBy: { createdAt: 'desc' }` (`page.tsx:167`)
  - Projects: `take: 5` (`page.tsx:168`)
  - Blog Posts: `take: 2` (`page.tsx:169`)
  - Testimonials: `take: 2`, `orderBy: { createdAt: 'desc' }` (`page.tsx:170-176`)
- **Exclusion Filters**:
  - Testimonials filter `status: PUBLISHED` and `permissionStatus: AUTHORIZED`.
  - Blog posts filter `status: PUBLISHED`.
  - **DEFECT**: `getPublicProjects` in `projectService.ts:19` checks `confidentiality: { not: 'PRIVATE' }`. As a result, `ANONYMIZED` projects are NOT excluded from the homepage 5-project query.

### Item 5: Contact Email & Fallback Logic
- **Grep Audit**: 12 occurrences of email literals or example domains (`05_email_grep.txt`). All instances in `app/` are input placeholders. Hardcoded test fixtures remain only in `scripts/seed.ts` and test specs.
- **Admin Field**: Available under `/admin/settings` (`publicContactEmail`).
- **Database Separation**: `publicContactEmail` is stored in the `SiteSetting` database table; inquiry routing (`EMAIL_OWNER_TO`) is stored in `.env`.
- **Display**:
  - `/contact`: Shows email if set; renders fallback message when unset.
  - **DEFECT**: `components/layout/footer.tsx` does NOT display `publicContactEmail`.
  - **DEFECT**: `app/(admin)/admin/settings/actions.ts:14` saves `publicContactEmail` without server-side email validation.

### Item 6: Live Update & Revalidation
- **Cache Invalidation**: `revalidatePath` in `app/(admin)/admin/services/actions.ts` invalidates `/services`, `/admin/services`, `/`, and `/[locale]/services`.
- **DEFECT**: No focus/visibility auto-refresh component (`document.visibilityState` / `window.onfocus`) exists. An already-open browser tab remains stale until the user manually reloads or navigates.

### Item 7: Blog Reading Time
- **Shared Implementation**: `lib/reading-time.ts` provides `calculateReadingTimeMinutes` and `formatReadingTime`.
  - Strips markdown formatting, code blocks, HTML tags, and images.
  - Uses standard 200 words per minute with `Math.ceil` and a minimum of 1 minute.
- **Call Sites**:
  - Listing: `app/[locale]/(public)/blog/page.tsx:11`
  - Detail: `app/[locale]/(public)/blog/[slug]/page.tsx:10`
- **Unit Verification**: `tests/unit/reading-time.test.ts` (5 tests passing: <200 words, 400 words, 401 words, identical rendering).

### Item 8: Media Library Flow
- **Architecture**: Implemented as an in-place modal dialog (`components/admin/MediaPicker.tsx`) rather than a standalone page redirect flow with URL parameters.
- **Architectural Divergence**: Because it operates via a modal dialog, no `returnTo` URL parameter or URL validation against `https://evil.com` or `javascript:` exists.
- **Centralization**: Embedded media listings were removed from Profile, Service, Project, and Blog forms in favor of `MediaPicker`. Central library is at `/admin/media`.

### Item 9: Language Parity & i18n
- **Key Parity**: 100% key parity across `messages/en.json`, `messages/am.json`, and `messages/om.json` verified by `tests/unit/translations-parity.test.ts`.
- **Identical Strings**: Documented in `09_identical_translations.json` (language switcher names: `English`, `አማርኛ`, `Afaan Oromoo`, and demo placeholders).
- **Owner Review Notice**: Linguistic and grammatical quality in Amharic and Afaan Oromo must be verified by a native speaker.

### Item 10: Legal Pages Testimonials
- **Absence Verified**: Neither `app/[locale]/(public)/privacy/page.tsx` nor `terms/page.tsx` renders or imports `TestimonialList` (`tests/unit/legal-pages-testimonials.test.ts`).
- **Presence on Home**: Verified in `app/[locale]/(public)/page.tsx:170`.

### Item 11: Dark-Only Theme
- **Theme Controls**: No `ThemeToggle` or `useTheme` switcher controls exist in `components/layout/header.tsx`.
- **Theme Enforcement**: `ThemeProvider` in `app/[locale]/layout.tsx` is locked with `defaultTheme="dark"`, `forcedTheme="dark"`, and `enableSystem={false}`.
- **Admin**: `app/(admin)/layout.tsx` sets `className="dark"`.
- **Tokens**: `app/globals.css` defines dark mode tokens on `:root`.

### Item 12: Full Quality Gate Results
1. **ESLint**: Passed with 0 errors (104 warnings) (`12_lint.txt`, 15,227 bytes).
2. **TypeScript**: Passed with 0 errors (`12_typecheck.txt`, 58 bytes).
3. **Next.js Production Build**: Compiled successfully in 50s; 31 static routes, 25 dynamic routes (`12_build.txt`, 3,081 bytes).
4. **Vitest Unit/Integration Suite**: 29 test files, 171 tests passed, 0 failed (`12_vitest.txt`, 37,891 bytes).
   - Baseline: 122 tests -> Current: 171 tests (+49 tests across 10 newly added test files; 0 tests removed or loosened).
5. **Playwright E2E Suite**: 85 tests total across 16 spec files. Headless shell issue resolved. Tests identified missing `<h1>` tags on `/services`, `/work`, `/blog`, and `/contact` across all locales.

---

## 3. Defects List Ordered by Severity with Proposed Fixes

### Defect 1 (CRITICAL — Security / Confidentiality Leak)
- **Item**: 2 (Project Link Confidentiality)
- **File**: `lib/dto/project.ts` (lines 56-57)
- **Evidence**: `toPublicCaseStudy` maps `liveUrl: project.liveUrl ?? null` without verifying `project.confidentiality === 'PUBLIC'`. ANONYMIZED projects disclose the live client URL in the public DTO.
- **Proposed Fix**:
  ```typescript
  // In lib/dto/project.ts:
  liveUrl: project.confidentiality === 'PUBLIC' ? (project.liveUrl ?? null) : null,
  ```

### Defect 2 (CRITICAL — Missing Database Migration)
- **Item**: 2 (Project Link Migration)
- **File**: `prisma/schema.prisma` (line 199) & `prisma/migrations/`
- **Evidence**: `liveUrl String?` exists in `prisma/schema.prisma`, but no corresponding migration exists under `prisma/migrations/`.
- **Proposed Fix**:
  Run `npx prisma migrate dev --name add_project_live_url` to create and record the migration.

### Defect 3 (HIGH — Missing UI Feature on Public Page)
- **Item**: 2 (Project Link on Detail Page)
- **File**: `app/[locale]/(public)/work/[slug]/page.tsx`
- **Evidence**: Grep confirms neither `liveUrl` nor `projectUrl` is referenced in the template. The project overview card does not display the live project URL or external link icon.
- **Proposed Fix**:
  Add the live URL link in the project overview section:
  ```tsx
  {project.liveUrl && (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm font-medium text-[#8063F7] hover:underline"
    >
      <span>{t('visitLiveProject') || 'Visit Live Project'}</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  )}
  ```

### Defect 4 (HIGH — Missing Heading Hierarchy Across Public Pages)
- **Item**: 12 (Accessibility / E2E Gate)
- **Files**:
  - `app/[locale]/(public)/services/page.tsx`
  - `app/[locale]/(public)/work/page.tsx`
  - `app/[locale]/(public)/blog/page.tsx`
  - `app/[locale]/(public)/contact/page.tsx`
- **Evidence**: Playwright E2E spec `tests/e2e/h1.spec.ts` fails with `Expected: 1, Received: 0` for all 4 pages in `en`, `am`, and `om`. Pages render badge spans instead of an `<h1>` element.
- **Proposed Fix**:
  Replace or wrap the section badge in each page header with an accessible `<h1>` element displaying `{t('title')}`.

### Defect 5 (MEDIUM — Missing Minimum Length Validation)
- **Item**: 1 (Testimonial Length)
- **Files**:
  - `app/[locale]/(public)/testimonials/TestimonialForm.tsx` (line 137)
  - `app/[locale]/(public)/testimonials/actions.ts` (line 38)
  - `server/services/testimonialService.ts` (line 33)
- **Evidence**: `TestimonialForm.tsx` has no `minLength={20}` attribute. `actions.ts` and `testimonialService.ts` only check `content.length > 200`. A 19-character testimonial is accepted.
- **Proposed Fix**:
  - Add `minLength={20}` to `<Textarea>` in `TestimonialForm.tsx`.
  - In `actions.ts` and `testimonialService.ts`:
    ```typescript
    if (!input.content || input.content.trim().length < 20) {
      return { success: false, error: 'Testimonial text must be at least 20 characters.' };
    }
    ```

### Defect 6 (MEDIUM — Homepage Project Query Excludes Only Private)
- **Item**: 4 (Home Limits)
- **File**: `server/services/projectService.ts` (line 20)
- **Evidence**: Query uses `where: { confidentiality: { not: 'PRIVATE' } }`. An ANONYMIZED project will be included on the homepage instead of being restricted to PUBLIC projects only.
- **Proposed Fix**:
  Provide an optional `confidentiality` filter parameter in `getPublicProjects` and pass `{ confidentiality: 'PUBLIC' }` in `app/[locale]/(public)/page.tsx`.

### Defect 7 (LOW — Missing Contact Email in Footer)
- **Item**: 5 (Contact Email)
- **File**: `components/layout/footer.tsx`
- **Evidence**: `footer.tsx` only renders copyright and navigation links; it does not display `publicContactEmail`.
- **Proposed Fix**:
  Retrieve `publicContactEmail` in `footer.tsx` (or pass it via props) and render it in the footer contact block.

### Defect 8 (LOW — Missing Focus/Visibility Live Refresh)
- **Item**: 6 (Live Update)
- **Evidence**: No component or hook listens to `visibilitychange` or `focus` events to trigger `router.refresh()`.
- **Proposed Fix**:
  Create a client utility component `<LiveTabRefresher />` in the root public layout:
  ```tsx
  'use client';
  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';

  export function LiveTabRefresher() {
    const router = useRouter();
    useEffect(() => {
      const handleFocus = () => router.refresh();
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') router.refresh();
      });
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }, [router]);
    return null;
  }
  ```

---
*Audit completed under read-only verification rules. No code, configuration, or database modifications were applied.*
