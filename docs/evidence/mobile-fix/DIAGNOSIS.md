# Mobile CSS Regression Diagnosis

**Date:** 2026-11-03  
**Audited Routes:** 12 public routes (`/en`, `/en/about`, `/en/work`, `/en/work/os-dashboard`, `/en/services`, `/en/services/web-development`, `/en/blog`, `/en/blog/first-post`, `/en/testimonials`, `/en/contact`, `/en/privacy`, `/en/terms`)  
**Audited Viewports:** 320px, 360px, 390px, 412px, 768px  
**Automated Probe Output:** `docs/evidence/mobile-fix/overflow-report.md`  
**Screenshots Stored At:** `docs/evidence/mobile-fix/shots/`

---

## 1. Executive Summary

A comprehensive automated Playwright probe was executed across all 12 public routes at 5 target viewport widths (60 total viewport-route combinations).

- **Mobile Viewports (320px, 360px, 390px, 412px):**
  - 11 of 12 routes have 0px overflow across 320px–412px.
  - Route `/en/blog/first-post` at 320px experiences **+7px overflow** due to an unwrapped bottom social action row (Like, Comment, Share buttons).
- **Tablet Viewport (768px):**
  - All 12 routes show an overflow of **+107px to +109px** (document scrollWidth 875px–877px vs innerWidth 768px).
  - The root cause is the **Header** component (`components/layout/header.tsx`), which switches to desktop flex navigation at the `md:` breakpoint (768px). At 768px, the combined intrinsic width of the logo, 6 text navigation links, language dropdown, and "Contact" CTA button is ~910px, overflowing the 768px viewport.
  - In addition, decorative ambient background glow elements (`-right-32 w-96 h-96 blur-[120px]`) on public hero sections protrude past the right edge because the surrounding wrappers lack `overflow-x: clip` / `overflow-hidden`.

---

## 2. Root Cause Breakdown

### A. Header Navigation Collision at `md` (768px)
- **Symptom:** Every public page at 768px has `scrollWidth: 875px` (+107px overflow).
- **Offending Element:** `<div class="hidden md:flex items-center gap-3">` and `<nav class="hidden md:flex gap-1.5 lg:gap-3">` inside `components/layout/header.tsx`.
- **Cause:** Tailwind's `md` breakpoint is `768px`. Activating horizontal desktop navigation with 6 items (`Work`, `Services`, `About`, `Blog`, `Contact`, `Testimonials`) plus the language selector button plus the Contact pill CTA at 768px exceeds the viewport width.
- **Commit:** Originates in initial template layout and remained when new nav links and pills were added.
- **Fix:**
  - Shift desktop nav breakpoint from `md:` to `lg:` (`hidden lg:flex`), and mobile toggle from `md:hidden` to `lg:hidden`. At 768px (portrait tablet), the clean mobile drawer is displayed without crowding or clipping.
  - Alternatively, make the desktop nav items compact at `md:` and hide redundant CTA text. Shifting the full navigation to `lg:` is the standard responsive pattern for 6+ navigation items.

### B. Ambient Blur Glow Protrusion (`-right-32`)
- **Symptom:** Elements like `<div class="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />` stick out 128px past the viewport edge.
- **Cause:** The layout root and section wrappers did not enforce `overflow-x: clip` / `overflow: hidden`, causing any element with a negative right margin or position to expand the root document `scrollWidth`.
- **Commit:** Introduced across page templates (`page.tsx`, `about/page.tsx`, `blog/page.tsx`, `contact/page.tsx`, `services/page.tsx`, `testimonials/page.tsx`, `work/page.tsx`).
- **Fix:**
  - Add `overflow-x-clip` on `data-testid="public-layout-root"` in `app/[locale]/(public)/layout.tsx`.
  - Wrap background decorative glow elements in `pointer-events-none absolute inset-0 overflow-hidden` containers on each affected page.

### C. Unwrapped Action Bar on Blog Detail (`/en/blog/first-post`) at 320px
- **Symptom:** ScrollWidth is 327px at 320px viewport (+7px overflow).
- **Offending Element:** `<button aria-label="Share">` in `components/blog/BlogPostClientView.tsx`.
- **Cause:** The flex row containing Like, Comment, and Share buttons (`flex items-center justify-between`) lacked `flex-wrap` and flexible gaps. Inside the article card on a 320px screen (with ~32px card padding), three buttons + gap exceed 288px.
- **Commit:** Introduced in Day 7/8 blog client view implementation.
- **Fix:** Add `flex-wrap gap-2` to the social action bar container and child button clusters so items neatly wrap on narrow screens.

### D. About Profile Image Card Dimensions (Part B / Task 4 Alignment)
- **Symptom:** About profile image card styling needs explicit intrinsic 720x1280 (9:16) rendering centered within its original small card dimensions at 375px, 768px, 1280px without crop, distortion, or layout stretch.
- **Offending Element:** `app/[locale]/(public)/about/page.tsx` profile image container.
- **Fix:** Implement Part B specification (small outer container, inner centered 9:16 frame, `object-contain`, explicit intrinsic 720x1280 sizing).

---

## 3. Files Requiring Fixes

1. `app/[locale]/(public)/layout.tsx`: Add `overflow-x-clip` backstop to public layout root.
2. `components/layout/header.tsx`: Update responsive breakpoints from `md:` to `lg:` (`hidden lg:flex`, `lg:hidden`) to eliminate 107px overflow on 768px tablet viewports.
3. `components/blog/BlogPostClientView.tsx`: Add `flex-wrap gap-2.5` to the bottom social action bar to eliminate 7px overflow on 320px screens.
4. `app/[locale]/(public)/about/page.tsx`:
   - Enclose decorative glow in `overflow-hidden`.
   - Update About profile image container to Part B 9:16 centered contain specification.
5. `app/[locale]/(public)/page.tsx`:
   - Enclose hero decorative glow in `overflow-hidden`.
   - Integrate Task 3 (Hero Animated Engineer ID Badge).
6. `app/[locale]/(public)/work/page.tsx`: Enclose background glow in `overflow-hidden`.
7. `app/[locale]/(public)/services/page.tsx`: Enclose background glow in `overflow-hidden`.
8. `app/[locale]/(public)/blog/page.tsx`: Enclose background glow in `overflow-hidden`.
9. `app/[locale]/(public)/testimonials/page.tsx`: Enclose background glow in `overflow-hidden`.
10. `app/[locale]/(public)/contact/page.tsx`: Enclose background glow in `overflow-hidden`.
11. `components/admin/ProfileForm.tsx`: Add recommended aspect ratio hint (`Recommended: 9:16 vertical (e.g. 720x1280)`) and non-blocking warning when uploaded image is wider than tall.
12. `messages/en.json`, `messages/am.json`, `messages/om.json`: Add translations with 100% parity for new Engineer Badge and Profile form strings.

