# C2.a Email Notification Matrix & Verification Report

## 1. Specification Matrix

| Event | Recipient | Trigger File:Line | Exists | Tested |
| :--- | :--- | :--- | :--- | :--- |
| **New inquiry -> Owner** | Owner (`EMAIL_OWNER_TO`), Reply-To set to client (`inquiry.email`) | `server/services/inquiryService.ts:73` | YES | YES (`tests/unit/email-matrix.test.ts`, `tests/integration/contact.test.ts`) |
| **New inquiry -> Client acknowledgement** | Client (`inquiry.email`), Reply-To set to public contact email | `server/services/inquiryService.ts:84` | YES (governed by `sendVisitorAcknowledgement` toggle; supports `en`/`am`/`om` locales; rate limited per IP and recipient) | YES (`tests/unit/email-matrix.test.ts`, `tests/integration/contact.test.ts`) |
| **Inquiry status change -> Client** | Client (`inquiry.email`) | `server/services/inquiryService.ts:186` (via Admin UI `app/(admin)/admin/inquiries/[id]/page.tsx:71`) | YES (governed by "Notify client" checkbox in admin, default OFF; NEVER sent for `LOST` or `ARCHIVED`) | YES (`tests/unit/email-matrix.test.ts`) |
| **New testimonial -> Owner** | Owner (`EMAIL_OWNER_TO`), Reply-To set to author email if provided | `server/services/testimonialService.ts:58` | YES | YES (`tests/unit/email-matrix.test.ts`) |
| **New comment -> Owner** | Owner (`EMAIL_OWNER_TO`), Reply-To set to commenter email | `app/actions/blog.ts:128` | YES | YES (`tests/unit/email-matrix.test.ts`) |

## 2. Implementation Summary
- **Client Acknowledgement Locales**: Added Amharic (`am`) and Afaan Oromoo (`om`) translations alongside default English (`en`) for automatic visitor inquiry receipt acknowledgements.
- **Admin Inquiry Status Update**: Added "Notify client" checkbox (default OFF) to the inquiry status update form in `app/(admin)/admin/inquiries/[id]/page.tsx`. In `inquiryService.updateStatus`, email is sent only when `notifyClient === true` and status is NOT `LOST` or `ARCHIVED`.
- **Owner Alerts for Testimonials & Comments**: Added automated notifications via `emailTransport.send` to `EMAIL_OWNER_TO` whenever a new public testimonial or blog comment is submitted.
- **Mocked Transport Suite**: Created `tests/unit/email-matrix.test.ts` covering 10 isolated assertions for recipients, Reply-To headers, locale matching, escaped content, and suppression flags. All 10 tests passed.

## 3. Live Resend Transport Verification
- **Command**: `npx tsx scripts/email-smoke.ts`
- **Exit Code**: `0`
- **Output File**: `docs/evidence/phase3/step59-email-smoke.txt`
- **Resend Message ID**: `01a188b0-6e3b-7712-ada5-09004b5dae6e`
- **Instructions for Owner**:
  1. Open the inbox configured as `EMAIL_OWNER_TO` in `.env.production`.
  2. Locate the email with subject `[Smoke Test] Resend Verification - <timestamp>`.
  3. Click the three vertical dots (More options) and select **"Show original"**.
  4. Confirm that headers show:
     - `SPF: PASS with IP ...`
     - `DKIM: 'PASS' with domain resend.dev` (or custom verified domain)
     - `DMARC: 'PASS'`

