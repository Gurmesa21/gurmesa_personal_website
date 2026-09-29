# Security Notes

## CSRF Protection
All state-changing operations in the admin interface are implemented using Next.js Server Actions. Next.js natively provides CSRF protection for Server Actions by verifying the Origin header and strictly validating the action ID. No manual CSRF tokens are required.

## Redirect Review
We use the standard `redirect()` function from `next/navigation` within server actions to route the user after a successful mutation. For authentication, we explicitly implement a `redirect` callback in the NextAuth.js (`Auth.js`) configuration to enforce that any user-supplied `callbackUrl` only redirects to a relative path (`/`) or to the exact verified same-origin base URL. Any external or unverified URL falls back safely to `/admin`. We do not use user-supplied URLs for redirection in any custom endpoints.
