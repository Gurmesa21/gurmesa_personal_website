# Security Review & Audit (B1.d)

**Date**: 2026-10-28  
**Scope**: Production Readiness Security Assessment  
**Environment**: Render Free Tier Web Service + Render Key Value Redis + Neon Postgres + Neon Object Storage  

---

## 1. Executive Summary

This security review audits the Gurmesa portfolio and administrative platform across authentication, network transport, rate limiting, data protection, injection risks, file processing, and third-party dependencies.

| Audit Category | Status | Notes |
| :--- | :--- | :--- |
| **HTTPS & HSTS** | `VERIFIED` | HSTS configured with 2-year duration, subdomains, preload in production |
| **Auth.js Session Security** | `VERIFIED` | `__Secure-` prefix, `httpOnly`, `sameSite: lax`, `secure: true` in production |
| **Login Throttle & Error Hygiene** | `VERIFIED` | 5 attempts / 5 mins; in-memory fallback on Redis failure; generic errors |
| **Server-Action Origin Checks** | `VERIFIED` | Enforced by Next.js Server Actions origin validation |
| **HTTP Security Headers & CSP** | `VERIFIED` | Full CSP with dynamic Neon storage origin; clickjacking DENY; nosniff |
| **25MB Upload Ceiling & Magic Bytes** | `VERIFIED` | Hard 25MB limit with binary magic-byte verification (JPEG, PNG, GIF, WebP, PDF, MP4) |
| **Open Redirects Prevention** | `VERIFIED` | All redirects strictly bound to internal static routes (`/admin/*`) |
| **SSRF Audit (`project.liveUrl`)** | `VERIFIED` | URL is stored and rendered as client outbound link; never fetched server-side |
| **SQL Injection Audit** | `VERIFIED` | Zero raw dynamic SQL concatenation; only static `SELECT 1` in `/api/health` |
| **npm Audit Vulnerabilities** | `ACCEPTED RISK` | 4 upstream package advisories documented; recommended update path provided |
| **Log Hygiene** | `VERIFIED` | No passwords, tokens, connection strings, or PII logged to stdout/stderr |
| **Inquiry Retention Purge** | `VERIFIED` | Automated purge script `scripts/purge-old-inquiries.ts` with `--dry-run` |
| **Admin 2FA Architecture** | `OWNER ACTION` | Implementation roadmap for TOTP / WebAuthn step-up authentication |

---

## 2. Detailed Findings & Verification

### 2.1 HTTPS & Transport Security (HSTS)
- **Status**: `VERIFIED`
- **Configuration** (`next.config.ts`):
  ```typescript
  if (isProd) {
    securityHeaders.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    });
  }
  ```
- **Verification**: In production mode, all responses return `Strict-Transport-Security` forcing HTTPS across all subdomains for 63,072,000 seconds (2 years) eligible for HSTS preload.

### 2.2 Auth.js Trust Host & Session Cookies
- **Status**: `VERIFIED`
- **Configuration** (`auth.ts`):
  ```typescript
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  }
  ```
- **Trust Host**: `AUTH_TRUST_HOST="true"` configured in `.env.production` and `.env.example`, allowing Auth.js to trust reverse proxies (Render / Cloudflare) while verifying Host headers.

### 2.3 Login Throttle & Generic Error Messages
- **Status**: `VERIFIED`
- **Rate Limiting**: `LoginRateLimiter` enforces 5 attempts per 5 minutes per email.
- **Fail-Safe Hardening**: When Redis is unreachable, `LoginRateLimiter` automatically falls back to an internal per-instance `InMemoryStore` and enforces the 5-attempt limit. It **never fails open** on login.
- **Generic Responses**: `auth.ts` returns `null` uniformly for nonexistent users, inactive users, and incorrect passwords, preventing account enumeration.

### 2.4 Server-Action Origin Checks
- **Status**: `VERIFIED`
- Next.js App Router server actions inherently validate the `Origin` and `Host` headers for all incoming mutations. Cross-site requests from untrusted origins are rejected before execution.

### 2.5 Security Headers & Content Security Policy (CSP)
- **Status**: `VERIFIED`
- **Headers Verified**:
  - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
  - `X-Frame-Options: DENY` (Clickjacking prevention)
  - `Referrer-Policy: strict-origin-when-cross-origin` (Referrer leakage control)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (Disables unused browser hardware)
  - `Content-Security-Policy`: Disallows unsafe object embeds (`object-src 'none'`), disallows iframe framing (`frame-ancestors 'none'`), restricts forms (`form-action 'self'`), and dynamically whitelists the configured Neon Object Storage endpoint (`img-src`, `media-src`, `connect-src`).

### 2.6 25MB Upload Ceiling & Magic-Byte File Validation
- **Status**: `VERIFIED`
- **Validation** (`lib/storage/validation.ts`):
  - Hard limit of 25MB (`25 * 1024 * 1024` bytes) prevents storage exhaustion and large file denial-of-service.
  - Header inspection verifies magic bytes:
    - JPEG: `FF D8 FF`
    - PNG: `89 50 4E 47`
    - GIF: `47 49 46 38`
    - WebP: `52 49 46 46` ... `57 45 42 50`
    - PDF: `25 50 44 46`
    - MP4: Bytes 4–7 equal `ftyp` (`66 74 79 70`)
  - Any file failing magic-byte validation is immediately rejected without disk persistence.
  - Compensating cleanup: If database record insertion fails after upload, the uploaded object is immediately deleted from storage.

### 2.7 Open Redirects Prevention
- **Status**: `VERIFIED`
- Grep audit across all server actions and pages confirms that all `redirect(...)` invocations target hardcoded relative internal paths (e.g. `/admin/blog`, `/admin/login`, `/admin/projects`). No user-supplied parameters are passed directly to `redirect()`.

### 2.8 SSRF Audit (`project.liveUrl`)
- **Status**: `VERIFIED`
- **Verification**: `project.liveUrl` is validated as a standard URL string during form submission, persisted in PostgreSQL, sanitized through DTO mapping (`toPublicCaseStudyDTO` exposes it only when `confidentiality === 'PUBLIC'`), and rendered strictly on the client as `<a href={project.liveUrl} target="_blank" rel="noopener noreferrer">`.
- The server never makes outbound HTTP requests or fetches `liveUrl`, completely eliminating SSRF vectors.

### 2.9 SQL Injection Audit
- **Status**: `VERIFIED`
- Grep audit across the codebase reveals:
  - `$executeRaw`: 0 occurrences.
  - `$queryRaw`: 1 occurrence in `app/api/health/route.ts` executing static constant `SELECT 1` for database health check.
  - Zero dynamic SQL string concatenation exists in application code. All queries utilize Prisma's strongly typed, parameterized ORM client.

### 2.10 npm Audit Report
- **Status**: `ACCEPTED RISK`
- **Raw Evidence**: Saved in `docs/evidence/b1/04-audit.txt`.
- **Summary**:
  - `next (16.0.0 - 16.4.0)`: Upstream advisory regarding experimental caching and image optimization.
  - `sharp (<0.35.5)`: Upstream advisory in librsvg.
  - `source-map-js (1.0.0 - 1.2.1)`: Transitive dev/build dependency.
  - `vite (8.3.0 - 8.3.2)`: Test runner dependency.
- **Remediation**: Can be resolved in a future dependency update cycle via `npm update next sharp`. None of the experimental Next.js features (`use cache` with typed arrays) are utilized in production runtime.

### 2.11 Log Hygiene
- **Status**: `VERIFIED`
- Inspection of logging across `server/`, `lib/`, and `app/` confirms:
  - Error logs in `lib/rate-limit/index.ts` sanitize connection strings and print only controlled error messages without leaking credentials.
  - No authorization tokens, session cookies, database connection strings, or customer email addresses are logged to stdout/stderr.

### 2.12 Inquiry Retention Purge
- **Status**: `VERIFIED`
- Script `scripts/purge-old-inquiries.ts` implements automated inquiry retention and data minimization:
  - Reads `inquiryRetentionDays` from `siteSetting` (defaults to 365 days).
  - Supports `--dry-run` to audit deletable records without modification.
  - Recommended deployment: Add a recurring monthly or weekly cron job via Render Cron Job (`npx tsx scripts/purge-old-inquiries.ts`).

### 2.13 Admin 2FA Recommendation
- **Status**: `OWNER ACTION`
- **Recommendation**: To protect admin credentials against credential stuffing or compromised passwords:
  1. Add `twoFactorSecret` and `twoFactorEnabled` fields to `AdminUser` model.
  2. Implement TOTP verification (e.g. using `otplib` or `@simplewebauthn`) during admin login.
  3. Require 2FA code step-up after primary password validation in `auth.ts`.
