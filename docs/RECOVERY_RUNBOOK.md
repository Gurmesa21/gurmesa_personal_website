# Disaster Recovery and Operations Runbook

This document defines standard operating procedures for database recovery, backup restoration, service rollback, secret rotation, and object storage recovery for the Gurmesa Personal Website architecture.

---

## 1. Neon Point-in-Time Restore (PITR)

Neon provides native storage-level instant branching and historical restoration.

### Retention Windows
- **Free Plan**: **6 hours** history retention window.
- **Launch Plan**: Up to **7 days** (configurable).
- **Scale Plan**: Up to **30 days** (configurable).

### Procedure: Rollback / Restore via Neon Console
1. Navigate to [Neon Console](https://console.neon.tech).
2. Select the project (`gurmesa-website` / `raspy-mountain`).
3. Under **Branches**, select the branch you wish to restore (e.g. `main`).
4. Click **Restore from history**.
5. Select the point in time (timestamp or LSN) immediately preceding the incident.
6. Choose:
   - **Restore in-place**: Overwrites current branch to that timestamp (**RTO < 10 seconds**).
   - **Branch from history**: Creates a new branch from that historical state for non-destructive verification before cutover.

### Procedure: Restore via Neon CLI
```bash
# List branches to find branch ID
neon branches list

# Restore branch to a specific UTC timestamp
neon branches restore <branch-id> --to-timestamp "2026-10-28T20:00:00Z"
```

---

## 2. Restore from Nightly Encrypted `pg_dump`

If an incident occurred beyond the 6-hour Free tier PITR window, use the encrypted nightly backup stored in GitHub Actions artifacts.

### Prerequisites
- Owner GPG private key installed locally on administrator machine.
- PostgreSQL 16 client tools (`pg_restore` / `psql`).

### Step-by-Step Recovery
1. **Download Backup**:
   - Go to GitHub Repository -> **Actions** -> **Nightly Database Backup**.
   - Download the latest `neon-database-backup.zip` artifact.
   - Unzip to retrieve `db_<timestamp>.dump.gpg`.

2. **Decrypt Dump**:
   ```bash
   gpg --decrypt --output db_restore.dump db_<timestamp>.dump.gpg
   ```

3. **Verify Target Database Connection**:
   ```bash
   export TARGET_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
   psql "$TARGET_URL" -c "SELECT current_database();"
   ```

4. **Execute Restoration**:
   Using `pg_restore` with custom format:
   ```bash
   pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$TARGET_URL" db_restore.dump
   ```

5. **Verify Row Counts**:
   Run the verification drill script to confirm all tables are populated:
   ```bash
   DATABASE_URL="$TARGET_URL" npx tsx scripts/restore-drill.ts
   ```

---

## 3. Render Web Service Rollback

Render supports instant zero-downtime deployment rollbacks.

### Dashboard Rollback
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Open the Web Service (`gurmesa-website`).
3. Click the **Events** or **Deploys** tab.
4. Locate the last known good deployment (marked "Live").
5. Click the three dots (`...`) next to that deployment and select **Rollback to this deploy**.
6. Render deploys the previous container image immediately without re-running build steps (**RTO < 60 seconds**).

### Migration Compatibility (Forward-Only Rule)
- Database schema migrations are strictly forward-only.
- If a bad code deploy was coupled with a schema migration, the application code must remain backward-compatible with the schema. Never execute `prisma migrate reset` in production.

---

## 4. Secret Rotation Runbook

When rotating credentials, follow the defined zero-downtime rotation order:

| Secret | Service Impact | Rotation Procedure |
|---|---|---|
| `AUTH_SECRET` | NextAuth user sessions | 1. Generate new 32-byte secret (`openssl rand -base64 32`).<br>2. Update in Render environment.<br>3. Trigger deploy. Users will be asked to re-authenticate. |
| `LIKE_HASH_SECRET` | Anonymous blog likes | 1. Generate new 32-byte secret.<br>2. Update in Render environment.<br>3. Existing like totals remain intact; anonymous client hash deduplication restarts. |
| `STORAGE_ACCESS_KEY` & `STORAGE_SECRET_KEY` | Media uploads & reads | 1. Generate new credential in Neon Console -> Storage -> Credentials.<br>2. Update `STORAGE_ACCESS_KEY` and `STORAGE_SECRET_KEY` on Render.<br>3. Delete old credentials in Neon after deploy succeeds. |
| `EMAIL_API_KEY` | Transactional email | 1. Create new API key in Resend dashboard.<br>2. Update `EMAIL_API_KEY` on Render.<br>3. Delete old key in Resend dashboard after first successful email send. |
| `DATABASE_URL` / `DIRECT_URL` | Postgres database | 1. Reset password in Neon Console -> Roles.<br>2. Update `DATABASE_URL` and `DIRECT_URL` on Render.<br>3. Service restarts and connects with new password. |

---

## 5. Object Storage Loss & Recovery

Because Neon Object Storage is branch-aware and in preview, an automated media backup mechanism protects uploaded assets.

### Scheduled Media Backup
Run the media backup script to maintain a local/secondary copy of all assets:
```bash
npx tsx scripts/media-backup.ts
```
The script downloads all objects from the S3 bucket to `./backups/media/<timestamp>/`.

### Recovery after Bucket Deletion or Corruption
1. **Recreate Bucket**:
   In Neon Console (or via `neon buckets create avenor-media --access public_read`).
2. **Re-upload Backed-Up Objects**:
   Using AWS CLI or S3 client, re-upload objects from `./backups/media/<timestamp>/` maintaining key prefixes:
   ```bash
   aws s3 sync ./backups/media/<timestamp>/ s3://avenor-media/ \
     --endpoint-url="$STORAGE_ENDPOINT"
   ```
3. **Verify Public URL Access**:
   Run the smoke test to confirm upload, fetch, and delete:
   ```bash
   npx tsx scripts/storage-smoke.ts
   ```
