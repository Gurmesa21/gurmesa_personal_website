# Pre-Launch Checklist (SRS 19.2)

1. [x] **Confidentiality & Access Control** - **Done** (Evidence: Playwright routing and auth test passes from Day 10-11).
2. [x] **XSS & Content Security** - **Done** (Evidence: Markdown sanitizer stripping raw HTML verified in `tests/e2e/blog.spec.ts` from Day 13b).
3. [x] **Rate Limiting** - **Done** (Evidence: Redis implementation for contact and inquiry endpoints from Day 6).
4. [x] **SEO & Metadata** - **Done** (Evidence: Sitemaps, robots.txt, and dynamic `metadataBase` with `SITE_URL` fallback from Day 5/14).
5. [x] **Performance Optimization** - **Done** (Evidence: Lighthouse LCP improved to ~3.0s and INP < 250ms via Server Component isolation from Day 13c).
6. [x] **CI/CD Pipeline Functional** - **Done** (Evidence: `ci.yml` actively runs static analysis, unit tests, and Playwright tests in isolated DB containers from Day 7/14).
7. [x] **Database Backup & Restore** - **Done** (Evidence: Real `pg_dump` and `pg_restore` round-trip passed with exact row matches from Day 14).
8. [ ] **Media / S3 Storage Provisioned** - **Owner action required** (Must provision actual production buckets, inject credentials, and enable versioning).
9. [ ] **Custom Domain & SSL Set Up** - **Owner action required** (Must configure production domains and update `SITE_URL`).
10. [ ] **Production Environment Variables** - **Owner action required** (Ensure NextAuth, Database, and Storage secrets are accurately populated).
11. [ ] **Uptime Monitoring & Alerts** - **Not yet done** (External uptime monitoring tool needs configuration as per SRS 15.5).
