# C2.b Backup & Disaster Recovery Verification Report

## 1. Executive Summary & Restore Drill Audit

### Metrics & Results
- **Source Database**: `gurmesa_test_db`
- **Target Database**: `gurmesa_restore_drill_db` (fresh, isolated PostgreSQL database)
- **Method**: Full database export (`pg_dump -F c`) &rarr; Symmetric GPG Encryption (AES-256) &rarr; Destruction of raw dump &rarr; GPG Decryption &rarr; Database restoration (`pg_restore --clean --if-exists`) &rarr; Table-by-table row count audit.
- **Raw Dump Size**: **56,982 bytes**
- **Encrypted Dump Size**: **16,237 bytes** (compression + ciphertext)
- **Total Duration**: **19.25 seconds**
  - `pg_dump`: 1,493 ms
  - `gpg --encrypt` (AES-256): 2,547 ms
  - `gpg --decrypt`: 427 ms
  - `pg_restore`: 12,322 ms
  - Post-restore audit: ~2,400 ms
- **Tables Audited**: **27 / 27 tables matched with 100% parity (0 mismatches, 0 data loss)**.

### Per-Table Parity Verification

| Table | Source Rows | Target Rows | Status |
| :--- | :--- | :--- | :--- |
| `AdminUser` | 1 | 1 | **MATCH** |
| `AuditLog` | 12 | 12 | **MATCH** |
| `BlogComment` | 1 | 1 | **MATCH** |
| `BlogLike` | 0 | 0 | **MATCH** |
| `BlogPost` | 4 | 4 | **MATCH** |
| `CaseStudy` | 5 | 5 | **MATCH** |
| `Category` | 1 | 1 | **MATCH** |
| `Experience` | 2 | 2 | **MATCH** |
| `Inquiry` | 21 | 21 | **MATCH** |
| `InquiryNote` | 0 | 0 | **MATCH** |
| `MediaAsset` | 2 | 2 | **MATCH** |
| `Notification` | 16 | 16 | **MATCH** |
| `PostTag` | 0 | 0 | **MATCH** |
| `Profile` | 1 | 1 | **MATCH** |
| `Project` | 7 | 7 | **MATCH** |
| `ProjectMedia` | 0 | 0 | **MATCH** |
| `ProjectTechnology` | 5 | 5 | **MATCH** |
| `SEOOverride` | 0 | 0 | **MATCH** |
| `Service` | 5 | 5 | **MATCH** |
| `Session` | 0 | 0 | **MATCH** |
| `SiteSetting` | 3 | 3 | **MATCH** |
| `Skill` | 5 | 5 | **MATCH** |
| `SocialLink` | 3 | 3 | **MATCH** |
| `Tag` | 1 | 1 | **MATCH** |
| `Technology` | 4 | 4 | **MATCH** |
| `Testimonial` | 8 | 8 | **MATCH** |
| `_prisma_migrations` | 9 | 9 | **MATCH** |

### Explanation of the 0.42s Metric in B1 Report
In the earlier B1 report, `scripts/restore-drill.ts` only ran an iterative loop of 27 `SELECT COUNT(*)` queries across the already-seeded local PostgreSQL database; that query loop took 0.42 seconds. It did **not** perform an authentic dump, encryption, decryption, and restore into a separate database. The Phase 3 drill executed in this step replaces that theoretical shortcut with a real, authenticated execution (`pg_dump` &rarr; GPG encrypt &rarr; GPG decrypt &rarr; `pg_restore`) into `gurmesa_restore_drill_db` with full verification.

---

## 2. Owner Runbook: GPG Setup & Recovery on Windows

### Step A: Generate GPG Key Pair on Windows
1. Open PowerShell or Command Prompt. Ensure Git's GPG is available (or installed via Gpg4win):
   ```powershell
   & "C:\Program Files\Git\usr\bin\gpg.exe" --version
   ```
2. Generate an RSA 4096-bit key pair:
   ```powershell
   & "C:\Program Files\Git\usr\bin\gpg.exe" --full-generate-key
   ```
   - Kind of key: `(1) RSA and RSA`
   - Key size: `4096`
   - Valid for: `0` (does not expire, or your desired retention)
   - Real name: `Gurmesa Backup Key`
   - Email: `<your-email>`
   - Passphrase: Enter a strong, memorable passphrase (store securely in a password manager).
3. Find your Key ID:
   ```powershell
   & "C:\Program Files\Git\usr\bin\gpg.exe" --list-keys --keyid-format LONG
   ```
   Example output: `rsa4096/ABCD1234EF567890`. Here `ABCD1234EF567890` is your Key ID.
4. Export the Public Key (ASCII armored):
   ```powershell
   & "C:\Program Files\Git\usr\bin\gpg.exe" --armor --export ABCD1234EF567890 > backup_public_key.asc
   ```
5. Export the Private Key (backup securely offline):
   ```powershell
   & "C:\Program Files\Git\usr\bin\gpg.exe" --armor --export-secret-keys ABCD1234EF567890 > backup_private_key.asc
   ```

### Step B: GitHub Repository Secrets to Configure
In your GitHub repository settings under **Settings &rarr; Secrets and variables &rarr; Actions &rarr; New repository secret**, add:
1. `DATABASE_URL`: Connection string for the production Neon database (pooled or direct).
2. `BACKUP_GPG_PUBLIC_KEY`: Entire contents of `backup_public_key.asc` (used by `.github/workflows/nightly-backup.yml` to encrypt dumps).
3. *Alternative (Symmetric Passphrase mode)*: If you prefer symmetric encryption without managing GPG public/private key pairs, set `BACKUP_ENCRYPTION_PASSPHRASE` as a repository secret.
4. `EMAIL_API_KEY`: Resend API key (for failure alerts).
5. `EMAIL_FROM`: Alert sender email (e.g., `backups@yourdomain.com`).
6. `EMAIL_OWNER_TO`: Alert recipient email.

### Step C: Trigger Backup Workflow Manually
To test or trigger the backup on demand:
- **Via GitHub CLI**:
  ```powershell
  gh workflow run nightly-backup.yml
  ```
- **Via GitHub Web UI**:
  1. Go to your repository on GitHub.
  2. Click the **Actions** tab.
  3. In the left sidebar, click **Nightly Neon Database Backup**.
  4. Click the **Run workflow** dropdown on the right, select branch `main`, and click **Run workflow**.
  5. When complete, download the `neon-database-backup` artifact containing `db_<date>.dump.gpg`.

### Step D: Restoring from Encrypted Dump to Local or Staging Database
1. Decrypt the downloaded `.dump.gpg` file:
   ```powershell
   & "C:\Program Files\Git\usr\bin\gpg.exe" --decrypt --output restored_db.dump db_<date>.dump.gpg
   ```
2. Restore into a local Docker database:
   ```powershell
   docker cp restored_db.dump gurmesa_website-db-1:/tmp/restore.dump
   docker exec gurmesa_website-db-1 pg_restore -U dev_user -d gurmesa_test_db --clean --if-exists /tmp/restore.dump
   docker exec gurmesa_website-db-1 rm -f /tmp/restore.dump
   ```
3. Restore into a Neon staging branch:
   ```powershell
   pg_restore --dbname="postgresql://<user>:<password>@<neon-staging-host>/<staging-db>?sslmode=require" --clean --if-exists restored_db.dump
   ```
4. Securely delete the unencrypted `restored_db.dump` once restored.

