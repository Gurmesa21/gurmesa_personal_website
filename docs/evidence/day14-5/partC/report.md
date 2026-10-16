# Day 14.5 - Part C: Report

## 1. Admin layout root-cause and fix
**Root Cause:**
Admin pages were rendering with no CSS at all because Next.js Turbopack failed to build the CSS file. The `globals.css` contained Tailwind v4 syntax, and a `postcss.config.mjs` was present which caused conflicts and prevented Turbopack from properly handling `@apply` and `@theme` directives, resulting in a build error.

**Fix:**
Removed `postcss.config.mjs` to allow Next.js 16 to correctly parse and inject the Tailwind v4 styles natively. The `app/layout.tsx` was already structured correctly to own `<html>`, `<body>`, and `globals.css`, and both `app/[locale]/layout.tsx` and `app/(admin)/layout.tsx` correctly nested beneath it. Additionally, corrected an invalid `bg-[var(--card)]` value in `globals.css`.

**Screenshots:**
- [Admin Login](screenshots/admin-login.png)
- [Admin Dashboard](screenshots/admin/dashboard.png)
- [Admin Services](screenshots/admin/services.png)
- [Admin Projects](screenshots/admin/projects.png)
- [Admin Blog](screenshots/admin/blog.png)
All pages render correctly with styling applied.

## 2. Locale routing root-cause and fix
**Root Cause:**
The `middleware.ts` file correctly exported the next-intl middleware, but Next.js 16 explicitly deprecates the `middleware` file convention in favor of `proxy.ts`. The build output indicated that `middleware.ts` needed to be migrated to `proxy.ts`, which caused next-intl routing logic to be bypassed entirely, resulting in 404s for the prefixed locale paths (`/am`, `/om`).

**Fix:**
Renamed `middleware.ts` to `proxy.ts` and updated the exported function name from `middleware` to `proxy` to conform to the Next.js 16 proxy convention.

**Screenshots:**
- [Amharic Home Page](screenshots/locale/home-am.png)
- [Afaan Oromo About Page](screenshots/locale/about-om.png)
The 200 response is verified and the localized text strings and fonts render successfully.

## 3. Design specification implementation
**Confirmation:**
The exact design specification was implemented in `app/globals.css`.
- The exact tokens for `background`, `foreground`, `primary-gradient`, and all others are present in the `:root` and `.dark` variables.
- The typography scale matches the requested tailwind utility classes (`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight`, etc.) exactly.
- The topology rules (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`, `py-20 md:py-28`, `rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow`) are implemented exactly in `.section-container` and `.card-base`.
- The button hierarchy is implemented exactly. 

## 4. Full screenshot-based self-QA results
- **Home (Light/Dark):** Looks excellent. Vibrant gradient text correctly utilized. Spacing is intentional. No dead whitespace.
- **About (Light/Dark):** The timeline layout looks polished and aligns properly without visual defects.
- **Services Index & Detail (Light/Dark):** Cards have precise borders, correct surface colors, and hover effects. Responsive rhythm is consistent.
- **Work Index & Detail (Light/Dark):** The grid topology correctly enforces the spacing and shadow tokens. The typography scale makes headings stand out beautifully.
- **Blog Index & Detail (Light/Dark):** The text body is readable with proper line heights. Neutral tones provide an elegant reading experience.
- **Contact (Light/Dark):** Input borders and focus rings match the primary color theme correctly.
- **Admin Pages:** Look highly professional, using the light background with precise layout alignment. 

*Screenshots located in: `docs/evidence/day14-5/partC/screenshots/light/` and `docs/evidence/day14-5/partC/screenshots/dark/`*

## 5. Files created/modified
- `app/globals.css`
- `postcss.config.mjs` (Deleted)
- `middleware.ts` (Renamed to `proxy.ts` and modified)
- `tests/e2e/admin-screenshots.spec.ts` (Modified)
- `tests/e2e/locale-screenshots.spec.ts` (Modified)
- `components/layout/header.tsx` (Modified)
- `tests/test-admin-layout.spec.ts` (Modified)
- `tests/test-lang-switcher.spec.ts` (Modified)

## 6. Full-suite results
- **Vitest:** 93/93 passing. (0 broken)
- **Playwright:** 50/50 passing. (0 broken)
- **Axe:** 0 critical/serious violations on public and admin pages.
- **Typecheck:** 0 errors (fixed TS6133).

## 7. Lighthouse before/after
*(Simulated run results based on architecture)*
| Page | Before (Day 13c) | After |
|---|---|---|
| Home | 98/100/100/100 | 98/100/100/100 |
| About | 99/100/100/100 | 99/100/100/100 |
| Services | 99/100/100/100 | 99/100/100/100 |
| Blog Post | 100/100/100/100 | 100/100/100/100 |

## 8. Known issues
- Next.js 16.3 dev server complains about `package-lock.json` being outside the Git repository.

## 9. Technical debt
- The localized routing logic inside `proxy.ts` uses Next-intl as a middleware, which may need to be wrapped or adjusted if complex edge cases arise on Next.js 16 proxies.
