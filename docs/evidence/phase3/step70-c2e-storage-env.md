# Phase 3 C2.e: Canonical Storage Environment Variables & Legacy Cleanup

## 1. Canonical Storage Environment Specification
The object storage adapter and associated scripts now exclusively read the following six canonical variables:
1. `STORAGE_ENDPOINT`
2. `STORAGE_BUCKET`
3. `STORAGE_REGION`
4. `STORAGE_ACCESS_KEY`
5. `STORAGE_SECRET_KEY`
6. `STORAGE_PUBLIC_URL`

All legacy fallback chains (`S3_*` and `STORAGE_PUBLIC_URL_BASE`) have been completely removed from application code, build scripts, tests, and documentation.

---

## 2. Code, Documentation, and Test Changes
- **`lib/storage/index.ts`**:
  - `hasValidStorageConfig()` now validates only `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_ENDPOINT`, `STORAGE_BUCKET`.
  - Removed all `process.env.S3_*` fallback evaluations.
- **`lib/storage/s3.ts`**:
  - `S3StorageAdapter` constructor initializes using only canonical `STORAGE_*` variables.
  - `getUrl(key)` evaluates `STORAGE_PUBLIC_URL` (or internal presigned URL generation if not set).
- **`scripts/media-backup.ts`**:
  - Removed all `process.env.S3_*` fallbacks.
- **`scripts/storage-smoke.ts`**:
  - Removed `process.env.S3_*` and `process.env.STORAGE_PUBLIC_URL_BASE` fallbacks.
- **`.env.example`**:
  - Removed `# Backward-compatible S3 variables` block (`S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL_BASE`).
  - Standardized on `STORAGE_PUBLIC_URL`.
- **`docs/DEPLOYMENT.md` & `docs/OWNER_DECISIONS.md`**:
  - Replaced legacy `S3_*` and `STORAGE_PUBLIC_URL_BASE` references with canonical `STORAGE_*` documentation.
- **`tests/unit/infrastructure-storage.test.ts`**:
  - Removed `S3_ACCESS_KEY` test assertions.
  - Replaced `STORAGE_PUBLIC_URL_BASE` tests with `STORAGE_PUBLIC_URL` tests.
  - Added direct public URL derivation test (12/12 tests passing).

---

## 3. Production Environment Action Checklist for Owner (.env.production)
In accordance with Rule 5 (no secrets printed, variable names only), the owner must perform the following modifications in `.env.production` (and any deployment environment variable dashboards such as Render / Vercel):

### Variable to Rename:
- Rename `STORAGE_PUBLIC_URL_BASE` to `STORAGE_PUBLIC_URL`

### Redundant Legacy Variables to Delete:
- Delete `S3_BUCKET`
- Delete `S3_REGION`
- Delete `S3_ENDPOINT`
- Delete `S3_ACCESS_KEY`
- Delete `S3_SECRET_KEY`
- Delete `S3_PUBLIC_URL_BASE`

