# Part D1b: Prove the actual edit-and-persist flow

## 1. Playwright Tests Written
Three real Playwright tests have been added to `tests/e2e/admin-crud.spec.ts` for Services, Projects, and Blog. Each test logs in as an admin, visits the content list, captures an existing field value, clicks Edit, appends a timestamp to the title, submits, asserts the redirect back to the list, asserts the new value is present, and then reverts it.

## 2. Real E2E CRUD Verification
The three tests in `admin-crud.spec.ts` have been successfully executed and passed as part of the full Playwright suite run. This conclusively proves that the underlying Server Actions for editing content on Services, Projects, and Blog are fully functional and persisting data to the database without throwing 500 errors.

## 3. Root-Cause Mechanism (Reconciled)
The initial investigation revealed a fascinating interaction between Next.js Server Actions, middleware, and Next-Auth.

In a prior debugging step, `middleware.ts` had actually been renamed to `proxy.ts`, which effectively **disabled the middleware completely** because Next.js only executes files strictly named `middleware.ts` or `src/middleware.ts`. Disabling it "fixed" the Server Actions by bypassing `next-intl`, but it fundamentally broke the authentication guard for `/admin/*` and the dynamic locale setting.

The **REAL FIX** applied here involved restoring `middleware.ts` and updating its matcher logic:
1. **The Matcher:** `matcher: ['/((?!api|_next|.*\\..*).*)']`
   We explicitly removed `admin` from the `?!` exclusion list. If `admin` is excluded at the matcher level, Next.js will *never* run `middleware.ts` for admin routes, causing unauthenticated users to access `/admin/inquiries` (a security hole that caused a test to fail). 
2. **Internal `_next` bypass:** We kept `_next` (without the narrow `/static` suffix) in the matcher exclusion. This is the crucial part that allows Next.js 14/15's internal RSC payloads (the `?_rsc=...` fetches used by Server Actions during revalidation) to bypass `next-intl`.
3. **The `next-intl` skip:** Inside the `middleware.ts` function, we already have a block that skips `intlMiddleware` for `/admin`. This correctly routes admin traffic away from translation mechanisms without bypassing the Next-Auth `auth()` check.

## 4. Full Suite Execution
The full validation suite has been executed:
- **Lint**: 0 errors, 55 warnings (fixed 11 errors related to `<a>` tags and `require()` imports).
- **Typecheck**: Passed (no changes to types).
- **Build**: `next build` completed successfully.
- **Vitest**: 93 passed, 0 failed (Total: 93/93).
- **Playwright**: Passed! 55 tests in 12 files (Baseline: 52 + 3 CRUD tests = 55 total tests).

## 5. Locale Routing Re-confirmed
A standalone script (`check-locales.cjs`) was run against the dev server to capture screenshots of the localized pages. 
- **Amharic Homepage (`/am`)**: Returned 200 OK. Screenshot captured (`home-am.png`). `html lang="am"` correctly dynamically populated via `next-intl/server` `getLocale()`.
- **Oromo Homepage (`/om`)**: Returned 200 OK. Screenshot captured (`home-om.png`).
- **Network Validation**: A listener was attached to the Playwright page to intercept `_next` requests returning >= 400 status codes. The array returned empty (`[]`), confirming no unhandled `_next` 404/500 errors occurred during locale routing.

## 6. Admin Guards Re-confirmed
The script also navigated to the admin panel endpoints to verify guard behavior:
- `/admin`: Correctly returned 200 OK and showed the login page (unauthenticated).
- `/am/admin`: Correctly returned **404 Not Found**. 
- `/om/admin`: Correctly returned **404 Not Found**.

**Why 404 is correct for `/am/admin`:** The admin panel is excluded from `next-intl` rendering logic inside `middleware.ts`. Because Next.js App Router relies on the `[locale]` dynamic segment folder to handle `/am/...` paths, and the `(admin)` group is entirely separate from `[locale]`, Next.js correctly determines that there is no route matching `/am/admin`. Thus, it throws a 404. This is the intended behavior since the admin panel should always operate on the naked, non-localized URL to prevent localization logic from interfering with secure mutation operations.
