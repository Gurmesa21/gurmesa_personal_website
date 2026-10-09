# Owner Decisions Required (Final Audit)

Based on the Day 15 Final Production Audit, the following items require Owner review and approval.

## 1. Production Seed Strategy
Currently, `prisma/seed.ts` injects dozens of mock items, dummy blog posts, and fake testimonials. It also hardcodes the `admin@example.com` login.

**Proposal:**
Create a separate `prisma/seed-prod.ts` script explicitly guarded by `NODE_ENV=production`. This minimal seed should:
- Insert ONLY the required system defaults (e.g., initial `SiteSettings` like `publicContactEmail`).
- Insert an initial Admin user using credentials injected from a secure environment variable (e.g., `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`), rather than hardcoding.
- Create 0 dummy blog posts, testimonials, or projects.
- Keep the current `seed.ts` exclusively for local development and E2E testing (`PLAYWRIGHT_TEST=1`).

## 2. "Fake" / MVP UI Controls
The following UI controls visually exist and technically touch the database, but lack the expected production-grade lifecycle or backend protections:

1. **Blog "Like" Button**:
   - *Current State*: Functional server action (`incrementLike`), but lacks rate-limiting, session tracking, or IP restriction. A user can click it 1,000 times to artificially inflate metrics.
   - *Decision Needed*: Remove the button entirely, OR build out IP/Cookie tracking for likes.
2. **Blog "Comment" Button**:
   - *Current State*: Functional server action (`addComment`). However, comments are auto-approved (`isApproved: true`) upon submission, and there is no Admin UI to moderate, edit, or delete them. It is highly susceptible to spam bots.
   - *Decision Needed*: Remove the comment UI, OR build the Admin Comment Moderation queue and implement Turnstile/reCAPTCHA.
3. **Contact Page "Share" Buttons (Socials)**:
   - *Current State*: Validated, renders actual social links from the DB. Not fake.

## 3. Immediate Codebase Defect Fixes (Build Broken)
The production build currently fails. Please sign-off on resolving the following:
- **Admin Inquiries Typecheck**: Fix `app/(admin)/admin/inquiries/page.tsx` which references invalid `InquiryStatus` enum values (`IN_PROGRESS` and `REJECTED`).
- **SEC-ACL DTO Leaks**: `toPublicPost()` is leaking `comments` and `likesCount`, and `getPublicProfile()` is leaking `avatarId`. This breaks 2 Vitest security assertions.
- **Media Upload Tests**: An oversized upload correctly throws, but throws with a format validation message instead of a size validation message, breaking 1 Vitest assertion.

## 4. Pending Functional Requirements (SRS)
- **Home Availability Status (FR-HOME-09)**: The Hero section lacks the required "Available for hire" status dot.
- **About "Now" Section (FR-ABOUT-06)**: The "What I'm doing now" section was not built.
- **Service Pricing Tiers (FR-SVC-05)**: The DB supports a text `startingPriceRange`, but not the required tiered pricing table component.
- **Blog RSS/Atom Feed (FR-BLOG-10)**: The `/feed` endpoint was never implemented.

## 5. Third-Party Integrations
- **Uptime Monitoring**: A basic `/api/health` exists, but no external APM (Sentry, New Relic) or UptimeRobot is configured.
- **Object Storage**: Need to swap `MockStorageAdapter` for the real S3 adapter with actual AWS/R2 credentials in production.

## 6. Test-Only Flags
The following flags and test-specific routes currently exist and must be properly guarded against production usage.

| Flag / Route | Purpose | Production Guard Status |
|---|---|---|
| `PLAYWRIGHT_TEST` | Bypasses Redis rate-limiting; forces `MockStorageAdapter`; used by seed scripts. | **VERIFIED:** Successfully throws on startup in `next.config.ts` if `NODE_ENV=production`. |
| `AUTH_TRUST_HOST` | Overrides NextAuth domain resolution rules for Playwright/CI. | **VERIFIED:** NextAuth intrinsically enforces host matching in production mode unless explicitly misconfigured. |
| `/mock-storage` | Serves mock uploaded images as static resources during testing. | **VERIFIED:** Only functionally accessible and mounted into URLs when `PLAYWRIGHT_TEST=1`. |
