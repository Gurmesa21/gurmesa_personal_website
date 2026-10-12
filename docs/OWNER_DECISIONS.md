# Owner Decisions Required (Final Audit)

Based on the Day 15b Parts 8-14 release and Final Production Audit, the following items document the current verified system state and decisions for Owner review.

## 1. Production Seed Strategy
- **Test/Dev Seed (`scripts/seed.ts`)**: Used strictly for local development and E2E testing (`PLAYWRIGHT_TEST=1`). It is guarded by `guardTestEnvironment()` as its very first statement and refuses execution in production.
  - *VERIFIED*: `tests/integration/guard.test.ts::refuses to run seed.ts in production`
- **Production Minimal Seed (`scripts/seed-prod.ts`)**: Built to create initial system settings without mock portfolio posts, dummy blogs, or fake testimonials.

## 2. Blog Social Work (Released & Verified in Parts 8-14)
The social UI controls previously flagged as MVP have now been fully implemented, hardened, and verified to specification:
1. **Blog "Like" Button**:
   - Cryptographic `voterHash` using HMAC-SHA256 of IP + User-Agent keyed by `LIKE_HASH_SECRET`.
   - Startup throws in production if `LIKE_HASH_SECRET` is unset.
   - Toggle semantics (`like` -> `unlike`), `aria-pressed` with accessible labels.
   - Rejects non-published (DRAFT/ARCHIVED/unknown) posts.
   - Rate limiting: 10 requests/minute enforced via Redis.
   - Public DTO exposes only `likesCount` and `likedByMe`; raw IP and voter hash are never exposed.
   - *VERIFIED*: `tests/integration/blog-likes.test.ts` (Tests 1-8), `tests/e2e/partI-blog-social.spec.ts`
2. **Blog Comments & Moderation Queue**:
   - Additive DB migrations introducing `CommentStatus` (`PENDING`, `APPROVED`, `REJECTED`), `authorEmail`, and `moderatedAt`.
   - Public submission form requires name (2-50 chars), valid email (private, never published), content (3-1000 plain text chars), honeypot anti-spam, and rate limiting (5 submissions/hour via Redis).
   - Review moderation notice displayed to commenter; unapproved comments never render on public pages.
   - Admin Queue at `/admin/comments` allows filtering by status (`PENDING`, `APPROVED`, `REJECTED`, `ALL`), approving, rejecting, and deleting comments.
   - Every action checks session authentication, records an audit log row with session `actorId`, and calls `revalidatePath`.
   - *VERIFIED*: `tests/integration/blog-likes.test.ts` (Tests 9-20), `tests/e2e/admin-comments.spec.ts`
3. **Blog Share Button**:
   - Web Share API with fallback clipboard copy and `aria-live="polite"` feedback. CSP preserved.

## 3. Database Migration History
Both `gurmesa_db` and `gurmesa_test_db` have 8 migrations applied cleanly:
1. `20260926114052_init`
2. `20260928083821_day8_inquiry_delivery_testimonial_anonymity`
3. `20261008085400_add_notification`
4. `20261009060957_sync_schema`
5. `20261009104637_blog_likes`
6. `20261009104943_blog_comments_approval`
7. `20261012133755_add_comment_status_and_email`
8. `20261012135434_remove_is_approved`

## 4. Pending Functional Requirements (SRS Priorities)
The following features are pending implementation with their corresponding SRS priorities:
- **(FR-SVC-05, Priority: P2)**: Service Pricing Tiers table component (DB stores text range, but structured pricing table not built).
- **(FR-BLOG-10, Priority: P2)**: Blog RSS/Atom Feed endpoint (`/feed`).
- **(FR-HOME-09, Priority: P3)**: Home Availability Status indicator dot ("Available for hire").
- **(FR-ABOUT-06, Priority: P3)**: About "Now" section ("What I'm doing now").
- **(FR-ROUTE-01, Priority: P3)**: Standalone dedicated routes for `/resume` and `/now`.

## 5. Third-Party Integrations & Production Readiness
- **Uptime Monitoring**: `/api/health` verified with DB and Redis checks (`tests/integration/health.test.ts`). External APM (Sentry) or UptimeRobot to be hooked up by Owner upon domain DNS cutover.
- **Object Storage**: `lib/storage/` supports S3 adapter (`AWS_S3_BUCKET` / Cloudflare R2 credentials) for production, and local fallback adapter for CI and testing.
