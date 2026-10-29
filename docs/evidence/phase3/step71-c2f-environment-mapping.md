# Phase 3 C2.f: Environment Mapping & Storage Isolation Audit

## 1. Environment Infrastructure Mapping
In accordance with Rule 5 (no secrets, names only, first 8 characters of host IDs):

| Environment | Database Host / Branch ID (First 8 chars) | Bucket Branch ID (First 8 chars) | Redis Host (First 8 chars) |
| :--- | :--- | :--- | :--- |
| **Production** (`.env.production`) | `ep-raspy` (`ep-raspy-math...neon.tech`) | `br-raspy` (`br-raspy-math...neon.tech`) | `gentle-c` (`gentle-c...upstash.io`) |
| **Staging / Local Dev** (`.env`) | `localhos` (`localhost:5433`) | `br-raspy` (`br-raspy-math...neon.tech`) | `localhos` (`localhost:6379`) |
| **Test (Playwright / Vitest)** (`.env.test`) | `127.0.0.` (`127.0.0.1:5433`) | `N/A (MockStorage)` (`test-storage-bucket-name`) | `localhos` (`localhost:6379`) |

---

## 2. Storage Branch Isolation Proof & Analysis

### A. Playwright Smoke Project (`--project=smoke`)
- **Isolation Status**: **PROVEN ISOLATED**.
- **Proof**:
  1. `playwright.config.ts` lines 4 & 33-35 loads `.env.test` and sets `APP_ENV: 'test'` and `PLAYWRIGHT_TEST: '1'`.
  2. `lib/test-mode.ts` evaluates `process.env.APP_ENV === 'test' && process.env.PLAYWRIGHT_TEST === '1'`, returning `true`.
  3. `lib/storage/index.ts` lines 61-62 checks `if (isTestMode()) { instance = new MockStorageAdapter(); }`.
  4. All storage operations during Playwright smoke runs use `MockStorageAdapter` in-memory. Zero network traffic or API calls were dispatched to Neon Object Storage or any AWS S3 endpoint. Production data and buckets were 100% untouched.

### B. B0 Storage Smoke Test (`scripts/storage-smoke.ts`)
- **Isolation Status**: **CANNOT PROVE STAGING ISOLATION (SHARED BRANCH DETECTED)**.
- **Detailed Findings**:
  1. `scripts/storage-smoke.ts` runs directly as a standalone Node script via `npx tsx scripts/storage-smoke.ts`, loading `.env` via `dotenv.config()`.
  2. Inspection of `.env` reveals:
     - `STORAGE_ENDPOINT`: `https://br-raspy-math-b5fl7dc6.storage.c-7.us-east-2.aws.neon.tech`
     - `STORAGE_BUCKET`: `avenor-media`
  3. Inspection of `.env.production` reveals:
     - `STORAGE_ENDPOINT`: `https://br-raspy-math-b5fl7dc6.storage.c-7.us-east-2.aws.neon.tech`
     - `STORAGE_BUCKET`: `avenor-media`
  4. Both `.env` and `.env.production` point to the **identical Neon storage branch (`br-raspy-...`) and bucket name (`avenor-media`)**.
  5. **Conclusion**: We **cannot** prove that the B0 storage smoke test used an isolated staging storage branch. In fact, because both configuration files share the identical `br-raspy-...` host, the B0 smoke test executed against the exact same storage resource configured for production (uploading a transient `media/smoke-test-*.txt` and immediately issuing a delete command).
  6. **Recommendation for Owner**: In the Neon Console, create a dedicated staging storage branch (e.g., `br-staging-...`) and distinct bucket (e.g., `avenor-media-staging`), and update `.env` so non-production smoke tests never touch the production branch.

