# Phase 3 C2.d: Retention Purge Status & Schedule Proposal

## 1. Current Scheduling State
- **Current Schedule**: **NONE**.
- An exhaustive audit of the codebase confirms that `scripts/purge-old-inquiries.ts` is **not currently scheduled** by any automated mechanism:
  - No crontab or Linux scheduler entry exists.
  - No GitHub Actions scheduled workflow (`cron`) is configured in `.github/workflows/`.
  - No background worker process or node-cron scheduler is active in the application code.
  - No cloud scheduler (e.g., Render Cron Job, AWS EventBridge, Vercel Cron) is attached.
- Execution today requires manual invocation via `npx tsx scripts/purge-old-inquiries.ts` or `npx tsx scripts/purge-old-inquiries.ts --dry-run`.

---

## 2. Safe Schedule Proposal (NOT BUILT - Specification Only)

Per explicit instructions ("Propose, do not build, a safe schedule"), the following architecture is proposed for production deployment when authorized:

### A. Recommended Cadence
- **Frequency**: **Weekly** on Sunday at 03:00 UTC (`0 3 * * 0`).
  - *Rationale*: Inquiry retention is a data hygiene and minimization measure, not a real-time requirement. Running off-peak on weekends prevents database connection contention during business hours.

### B. Deployment Mechanism Options
1. **GitHub Actions Scheduled Workflow (Recommended for zero-cost maintenance)**:
   - Workflow file: `.github/workflows/inquiry-retention-purge.yml`
   - Trigger: `schedule: - cron: '0 3 * * 0'` and `workflow_dispatch` (for manual on-demand execution).
   - Environment: Reads `DATABASE_URL` and `DIRECT_URL` from GitHub repository production secrets.
   - Run step: `npx tsx scripts/purge-old-inquiries.ts`.
2. **Render Managed Cron Job**:
   - Command: `npm run purge:inquiries` (mapped to `tsx scripts/purge-old-inquiries.ts`).
   - Schedule: `0 3 * * 0`.
   - Uses the existing Render environment variables directly.

### C. Safety Guardrails & Hardening Recommendations Before Deployment
1. **Batching / Chunking**:
   - Currently, `scripts/purge-old-inquiries.ts` executes `prisma.inquiry.deleteMany()`.
   - On a large production table, an unbounded `deleteMany` can acquire extensive row locks or cause transaction timeouts.
   - *Recommendation*: Delete in batches of 200–500 IDs using a loop with a 50ms pause between batches.
2. **Exclusion of Active / Open Inquiries**:
   - Currently, the script purges based purely on `createdAt < cutoffDate`.
   - *Recommendation*: Ensure inquiries with status `NEW` or `IN_PROGRESS` are preserved or flagged with an alert to prevent deleting unresolved client communications.
3. **Audit Logging & Telemetry**:
   - Record purge events (timestamp, retention days, deleted count, execution duration) into `AuditLog` table.
   - If an error occurs during execution, send an alert to `EMAIL_OWNER_TO`.
4. **Retention Window Configuration**:
   - Retain flexibility via `SiteSetting` key `inquiryRetentionDays` (default: 365 days).
   - If the site owner reduces the retention window (e.g., to 90 days), run a dry run first to inspect the volume of records targeted.

---

## 3. GDPR Terminology Audit & Removal
- The user requested: *"Remove the phrase 'GDPR-compliant' from every document unless you can list exactly what was checked."*
- Full compliance with EU GDPR requires comprehensive legal and operational structures (e.g., formal Data Processing Agreements, legal basis determination under Article 6, Records of Processing Activities under Article 30, Data Protection Impact Assessments, verifiable Subject Access Request automation, and Data Protection Officer oversight). While `scripts/purge-old-inquiries.ts` enforces automated data minimization and storage limitation, labeling the system "GDPR-compliant" without full legal audit is inaccurate.
- **Actions Taken**:
  1. `docs/SECURITY_REVIEW.md:131`: Changed from `implements GDPR / data minimization compliance` to `implements automated inquiry retention and data minimization`.
  2. `docs/evidence/b1/REPORT.md:114`: Changed from `GDPR-compliant purge script` to `Automated data retention purge script`.
  3. Verification: Ran `git grep -n -i 'gdpr'` across repository; confirmed **0 remaining occurrences**.

