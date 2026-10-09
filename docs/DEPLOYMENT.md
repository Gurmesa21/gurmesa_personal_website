# Deployment Configuration

This document outlines the deployment strategy, environment variables, production commands, and CI/CD pipeline for the Gurmesa Portfolio application.

## Target Hosting Approach
The stack is designed for modern cloud hosting environments with the following requirements:
- **Application Server:** A Node.js environment capable of running Next.js App Router (e.g., Vercel, Railway, Render, or a custom VPS running Docker/PM2).
- **Database:** PostgreSQL >= 15. The application uses Prisma ORM to interact with the database.
- **Caching & Rate Limiting:** Redis >= 6. Used for API rate limiting to protect contact and inquiry forms.
- **Storage:** S3-compatible Object Storage (e.g., AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces) for media uploads and asset management.

## Environment Variables Inventory
The following environment variables are required for the application to function correctly. 
*Note: Variables marked as **[SECRET]** must be securely managed and never committed to source control.*

### Application & Routing
- `APP_ENV`: Defines the deployment environment (e.g., `production`, `test`, `development`). Must be set to `production` in production.
- `SITE_URL`: The canonical public URL of the deployment (e.g., `https://gurmesa.com`). Used for absolute URLs in metadata, sitemaps, and RSS feeds. (Not a secret).

### Database
- `DATABASE_URL`: **[SECRET]** The PostgreSQL connection string (e.g., `postgresql://user:password@host:port/dbname`). Used by Prisma to connect to the database.

### Redis
- `REDIS_URL`: **[SECRET]** The Redis connection string (e.g., `redis://host:port`). Used by `ioredis` for API rate limiting.

### Authentication (NextAuth / Auth.js)
- `AUTH_SECRET`: **[SECRET]** A random 32+ character string used to encrypt NextAuth session cookies. 
- `AUTH_URL`: The canonical URL for NextAuth (usually the same as `SITE_URL`). (Not a secret).
- `AUTH_TRUST_HOST`: Set to `true` when deploying behind a reverse proxy (e.g., on Vercel, Railway, or Docker with Nginx) so NextAuth trusts the forwarded host headers.

### Storage (S3-Compatible)
- `STORAGE_BUCKET`: The name of the S3 bucket used for media uploads. (Not a secret).
- `STORAGE_REGION`: The region of the S3 bucket (e.g., `us-east-1`). (Not a secret).
- `STORAGE_ACCESS_KEY`: **[SECRET]** The access key ID for the S3 bucket.
- `STORAGE_SECRET_KEY`: **[SECRET]** The secret access key for the S3 bucket.
- `S3_ENDPOINT`: (Optional) The custom endpoint URL if using a provider other than AWS S3 (e.g., MinIO or R2). (Not a secret).
- `S3_PUBLIC_URL_BASE`: (Optional) The public CDN URL base for the bucket (e.g., `https://cdn.example.com`), allowing the app to serve images via CDN rather than direct S3 URLs.

## Production Build and Start Commands

To build the application for production, run:
```bash
npm run build
```
This command compiles the Next.js application, generates static pages where possible, and builds the Node.js server.

To start the production server, run:
```bash
npm run start
```
*(Ensure `APP_ENV=production` is set in your environment).*

## Database Migrations in Production

**HARD RULE:** Never use `prisma migrate dev` or `prisma db push` in a production environment. These commands can destroy data or reset the database schema unexpectedly.

To apply database migrations in production, you must exclusively use:
```bash
npx prisma migrate deploy
```
This command safely applies pending migrations sequentially without resetting data. It should be run as part of your deployment script, *before* the application server starts.

## CI/CD Pipeline

The current CI/CD pipeline is defined in `.github/workflows/ci.yml` and is triggered on pushes and pull requests to the `main` branch. 

### What it does:
- Provisions a complete ephemeral environment using Docker service containers (PostgreSQL and Redis).
- Installs dependencies using `npm ci`.
- Sets up Playwright browser binaries.
- Runs the database migrations (`prisma migrate deploy`) and seeds the database against the test database container.
- Executes static analysis: `npm run lint` and `npm run typecheck`.
- Runs unit tests: `npm run test` (Vitest).
- Builds the Next.js application: `npm run build`.
- Executes end-to-end and security tests: `npx playwright test`.

### What it does NOT do:
- **The pipeline does NOT currently deploy the application.** It is purely a Continuous Integration (CI) pipeline used to verify code quality, security, and correctness. A Continuous Deployment (CD) step would need to be added to push the built artifact to the target hosting provider.

## Backup and Recovery (SRS 15.4)

### Backup Script
A standard backup script is provided at `scripts/backup-db.sh`. This script utilizes `pg_dump` to create a compressed, timestamped snapshot of the PostgreSQL database.
- **Requirements:** The `postgresql-client` package (which provides `pg_dump`) must be installed on the system executing the script.
- **Execution:** Run `./scripts/backup-db.sh`. It automatically extracts the connection string from `DATABASE_URL` in your environment or `.env` file and outputs a `.sql.gz` file to the `./backups` directory.

### Production Scheduling
This project assumes backups will be handled via a **Cron Job** executing the provided shell script on the database host or an attached utility instance. 
Example cron entry to run daily at 2:00 AM:
```cron
0 2 * * * /path/to/app/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```
*Note: If utilizing a managed database service (e.g., AWS RDS, Supabase, Neon), it is highly recommended to rely on their automated Point-in-Time Recovery (PITR) and daily snapshot features instead of this manual script.*

### Recovery Procedure
To restore a backup, use the provided `scripts/restore-db.sh` script.
- **WARNING:** This will execute the SQL dump against the target database. Ensure you are restoring to the correct environment.
- **Execution:** Run `./scripts/restore-db.sh ./backups/backup_YYYYMMDD_HHMMSS.sql.gz [TARGET_DATABASE_URL]`
- **Testing:** The backup and recovery process was verified by dumping the local development database, creating a fresh database, restoring the dump, and asserting that row counts exactly matched.

## Media / Object Storage Durability
This project relies on an S3-compatible object storage provider (e.g., AWS S3, Cloudflare R2) for media uploads (images, PDFs). 
- **Currently Configured Backup:** The application itself does *not* provide an internal mechanism to back up S3 objects. It completely relies on the provider's built-in redundancy and replication.
- **Production Recommendation (Owner Action):** You must manually enable **Bucket Versioning** and potentially **Cross-Region Replication** natively within your S3 provider's console to ensure media durability against accidental deletion or regional outages. No automated synchronization script is provided in this repository.
