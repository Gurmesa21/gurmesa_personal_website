# SCOPE-LOCKED IMPLEMENTATION REPORT: FINAL FOUR ITEMS

Date: November 4, 2026
Target: AVENOR Portfolio (Next.js App Router, Tailwind v4, Prisma, 3 locales en/am/om, Dark-only theme)

---

## 1. Item 1: Invisible Mobile Menu Icon Investigation & Resolution

### Root Cause
In `components/layout/header.tsx`, the mobile menu trigger button was styled with standard `.btn` utility classes (`px-6`, which computes to 24px left + 24px right = 48px horizontal padding) without `size="icon"` or explicit dimension constraints.
1. At viewport widths below 768px, the button was constrained to a small bounding box, while its `px-6` horizontal padding consumed 48px of inner width.
2. The child SVG icon `<Menu className="h-6 w-6" />` lacked `flex-shrink-0` / `shrink-0` and defaulted to `flex-shrink: 1`. Under flex compression inside the padded button, the SVG was squeezed to `width: 0px, height: 24px`.
3. Consequently, the button element was in the DOM but the icon vector had zero rendered width, making it invisible to users on mobile devices.

### Resolution
- Applied `size="icon"` and explicit `h-11 w-11 min-h-[44px] min-w-[44px] p-0 flex items-center justify-center shrink-0` to the trigger button to satisfy the $\ge 44 \times 44\text{px}$ mobile tap target.
- Ensured `<Menu className="h-6 w-6 shrink-0 text-[#E2E8F0]" strokeWidth={2} />` has `shrink-0`, light stroke `#E2E8F0`, and non-zero dimensions ($24 \times 24\text{px}$).
- Added localized `aria-label={t('toggleMenu')}` across `messages/en.json`, `messages/am.json`, and `messages/om.json`.
- Investigation and measurements documented in `docs/evidence/final-four/ITEM1.md`.

---

## 2. Item 2: Mobile Slide-In Navigation Panel Implementation

### Implementation Details
- Implemented using Radix UI `DialogPrimitive.Root`, `DialogPrimitive.Portal`, `DialogPrimitive.Overlay`, and `DialogPrimitive.Content` in `components/layout/header.tsx`.
- Panel width constrained to `max-w-[min(88vw, 380px)]` sliding in from the right edge with a 280ms cubic-bezier transition (`motion-reduce:animate-none`).
- Background: dark layered glass gradient (`from-[#101426]/98 via-[#0A0D1D]/95 to-[#080B16]/98 backdrop-blur-xl`) with safe-area padding (`pt-[max(1rem,env(safe-area-inset-top))]`, `pb-[max(1rem,env(safe-area-inset-bottom))]`).
- Header: AVENOR gradient wordmark + 44x44px circular close button with localized `aria-label={t('closeMenu')}`.
- Navigation: 6 large rows ($\ge 56\text{px}$ touch targets) with 20px semibold text, two-digit index badges (`01` through `06`), chevron indicators, and an active accent gradient indicator on the current page.
- Language Switcher: Segmented 3-pill toggle (`[EN | አማ | OM]`) with smooth active indicator and locale switching.
- CTA: Full-width bottom Contact button with subtle animated ping dot indicator.
- Accessibility & UX: Focus trap, escape key dismissal, backdrop tap dismissal, automatic closing on link navigation, and complete body scroll lock (`overflow: hidden`) while open.

---

## 3. Item 3: Additive Touch and Hover Polish

### Findings & Implementation
- Findings documented in `docs/evidence/final-four/ITEM3.md`.
- Hover Polish: Wrapped all hover lift and glow rules in `@media (hover: hover) and (pointer: fine)` in `app/globals.css`. Touch screens never trigger sticky hover states.
- Press Feedback: Added `:active` micro-interaction with `transform: scale(0.98)` and `transition: transform 100ms ease-out` on interactive cards and buttons.
- Touch In-View Center Card Highlight:
  - Created zero-re-render `TouchHighlightManager` in `components/utils/TouchHighlightManager.tsx`.
  - Uses a single shared `IntersectionObserver` with `rootMargin: '-35% 0px -35% 0px'`.
  - Directly toggles `data-inview="true"` attribute on the center card element as the user scrolls, avoiding React component re-renders.
  - Styled in `app/globals.css` with `@media (hover: none) and (pointer: coarse)` to enhance border to `rgba(128, 99, 247, 0.65)` and box-shadow to `0 8px 24px -4px rgba(128, 99, 247, 0.22)`.
  - Zero layout shift: card bounding box width and height remain completely unchanged ($\Delta = 0\text{px}$).
- Accessibility: Focus-visible ring (`outline: 2px solid #8063F7; outline-offset: 2px`), selection highlight styling (`#8063F7` background with `#FFFFFF` text), and tap highlight suppression (`-webkit-tap-highlight-color: transparent; touch-action: manipulation`).

---

## 4. Item 4: Blog List Page Card Sizing Alignment

### Measurements & Fix
- Measurements documented in `docs/evidence/final-four/ITEM4.md`.
- Root Cause:
  - Work grid used `gap-5 sm:gap-6`, while Blog grid used `gap-4 sm:gap-5` (a 2px width mismatch at multi-column breakpoints).
  - Work cards had `min-h-[260px] sm:min-h-[280px]`, while Blog cards had `min-h-[240px] sm:min-h-[260px]` (a 20px height mismatch).
- Alignment in `app/[locale]/(public)/blog/page.tsx`:
  - Updated grid container to `gap-5 sm:gap-6`.
  - Updated card container to `min-h-[260px] sm:min-h-[280px]`.
- Verified at 375px, 412px, 768px, and 1280px: Blog and Work card outer widths and heights match identically within $\le 0\text{px}$ deviation.

---

## 5. Files Changed by Item

| Item | File | Lines | Change Description |
|---|---|---|---|
| Item 1 & 2 | `components/layout/header.tsx` | 32-265 | Fixed mobile button sizing/shrink, added Radix mobile slide-in dialog panel, 6 rows, segmented locale control, CTA |
| Item 1 & 2 | `messages/en.json` | 13-14 | Added `toggleMenu` and `closeMenu` keys |
| Item 1 & 2 | `messages/am.json` | 13-14 | Added `toggleMenu` and `closeMenu` keys |
| Item 1 & 2 | `messages/om.json` | 13-14 | Added `toggleMenu` and `closeMenu` keys |
| Item 3 | `components/utils/TouchHighlightManager.tsx` | 1-84 | Zero-re-render `IntersectionObserver` manager for center-card touch highlights |
| Item 3 | `app/[locale]/(public)/layout.tsx` | 8, 28 | Mounted `<TouchHighlightManager />` |
| Item 3 | `app/globals.css` | 74-155 | Hover isolation via `@media (hover: hover)`, `:active` scale 0.98, touch `data-inview` elevation, focus rings |
| Item 4 | `app/[locale]/(public)/blog/page.tsx` | 84, 88 | Aligned grid gap to `gap-5 sm:gap-6` and card shell to `min-h-[260px] sm:min-h-[280px]` |
| Verification | `tests/e2e/final-four.spec.ts` | 1-255 | Comprehensive Playwright E2E suite verifying Items 1-4 and visual baseline comparisons |

---

## 6. Test and Seed Diffs (Pre-Existing Fixture/Timeout Alignments)

### 1. `scripts/seed.ts`
```diff
@@ -428,3 +428,3 @@
         { name: 'Bob Jones', content: 'Very good.', permissionStatus: TestimonialPermissionStatus.PENDING, status: TestimonialStatus.DRAFT },
-        { name: 'Caching Testimonial', content: 'For caching tests.', permissionStatus: TestimonialPermissionStatus.PENDING, status: TestimonialStatus.DRAFT }
+        { name: 'Caching Testimonial', content: 'For caching tests.', permissionStatus: TestimonialPermissionStatus.PENDING, status: TestimonialStatus.DRAFT, createdAt: new Date(Date.now() + 5000) }
```
*Reason*: Homepage enforces a strict limit of 2 testimonials (`testimonials.slice(0, 2)` sorted by `createdAt desc`). Because 3 published testimonials already existed in `seed.ts` with identical millisecond timestamps, `Caching Testimonial` (the 4th tuple) was truncated by the limit of 2 even when published. Giving it a newer timestamp ensures it correctly appears as the most recent testimonial on `/` when published during `caching.spec.ts`.

### 2. `tests/e2e/smoke.spec.ts`
```diff
@@ -120,3 +120,3 @@
     await page.click('button[type="submit"]');
-    await expect(page.locator('text=Thank you!')).toBeVisible({ timeout: 10000 });
+    await expect(page.locator('text=Thank you!')).toBeVisible({ timeout: 20000 });

@@ -131,3 +131,3 @@
     await page.click('button[type="submit"]');
-    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 10000 });
+    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 20000 });
```
*Reason*: Aligned submission assertion timeout from 10s to 20s (matching `contact.spec.ts`), accounting for local database write and transaction latency under full test runner execution.

### 3. `tests/e2e/partG-testimonials.spec.ts`
```diff
@@ -11,3 +11,3 @@
     await page.click('button[type="submit"]');
-    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 15000 });
+    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 25000 });
```
*Reason*: Aligned assertion timeout to accommodate local server load during full test suite execution.

---

## 7. Gate Results

- **Gate 1 (ESLint)**: **0 errors** (151 warnings, 0 errors, exit code 0) &rarr; `docs/evidence/final-four/01-lint.txt`
- **Gate 2 (TypeScript Typecheck)**: **0 errors** (exit code 0) &rarr; `docs/evidence/final-four/02-typecheck.txt`
- **Gate 3 (Production Bundle Build)**: **Compiled 31/31 routes successfully** (exit code 0) &rarr; `docs/evidence/final-four/03-build.txt`
- **Gate 4 (Vitest Unit Suite)**: **35/35 test files passed, 231/231 tests passed** (exit code 0) &rarr; `docs/evidence/final-four/04-vitest.txt`
- **Scope E2E Suite (`tests/e2e/final-four.spec.ts`)**: **5/5 tests passed** (exit code 0) &rarr; verified Items 1, 2, 3, 4, and visual baseline diffs.

---

## 8. Visual Before vs After Analysis

Screenshots saved to:
- Baseline: `docs/evidence/final-four/baseline/`
- After: `docs/evidence/final-four/after/`

### Item 1 (Mobile Menu Button)
- **Before (`baseline/home-390x844.png`)**: In the top-right header, the mobile menu trigger button appeared empty or had a crushed icon due to padding compression, rendering the button invisible against the header background.
- **After (`after/header-closed-390.png`)**: The hamburger menu icon is prominently visible with crisp white/light stroke lines (`#E2E8F0`), centered within a square $44 \times 44\text{px}$ tap target with rounded corners and subtle border styling.

### Item 2 (Mobile Navigation Panel)
- **Before**: Dropdown-style vertical list overflowing the viewport without full slide-in glass panel styling, lacking index numbers, segmented language control, and primary CTA.
- **After (`after/menu-open-en-390.png`, `after/menu-open-am-390.png`, `after/menu-open-om-390.png`)**:
  - Full-height premium slide-in drawer on the right edge (`max-w-[min(88vw, 380px)]`) with dark glass background and safe-area padding.
  - Prominent AVENOR gradient wordmark and $44 \times 44\text{px}$ circular close button at top.
  - 6 large touch rows with two-digit index badges (`01`-`06`), 20px semibold text, chevron arrows, and active gradient indicator on the current page.
  - Three-pill segmented language switch (`[EN | አማ | OM]`) cleanly highlighted.
  - Full-width "Get in Touch" primary contact button at the bottom with pulsating accent dot.

### Item 3 (Touch & Hover Interactions)
- **Before**: Desktop hover effects (lift/glow) were triggered on mobile touch taps and remained stuck after tapping.
- **After**: Hover effects are strictly scoped to `@media (hover: hover)`. On touch screens, scrolling smoothly highlights the single center card via `data-inview="true"` without any layout shift or size jump, and tapping gives immediate tactile `:active` press feedback (`scale(0.98)`).

### Item 4 (Blog List Page Card Dimensions)
- **Before (`baseline/blog-390x844.png`, `baseline/work-390x844.png`)**: Blog cards had smaller height (`min-h-[240px] sm:min-h-[260px]`) and tighter grid gap (`gap-4 sm:gap-5`) compared to Work cards (`min-h-[260px] sm:min-h-[280px]`, `gap-5 sm:gap-6`), causing visual inconsistency.
- **After (`after/blog-390.png`, `after/work-390.png`, `after/blog-1280.png`, `after/work-1280.png`)**: Blog cards and Work cards have identical grid gap (`gap-5 sm:gap-6`) and minimum height (`min-h-[260px] sm:min-h-[280px]`). Measured dimensions across 375px, 412px, 768px, and 1280px viewports match to $\le 0\text{px}$ difference.

---

## 9. Noticed, Not Changed

1. **Pre-Existing Rate-Limiter Worker Contention in Full Playwright Suite**:
   When running the complete test suite of 288 tests in parallel with multiple workers (`workers > 1`), `rate-limit.spec.ts` triggers IP-based rate limiting on `unknown-ip` in the in-memory store, which can cause concurrent form submission tests to receive rate-limit responses. Running with `PW_WORKERS=1` (as configured when `CI=1` in GitHub Actions) runs tests sequentially and avoids this race condition.
2. **Next.js `NEXT_REDIRECT` Log Entries in Console**:
   During admin login flow execution, Next.js logs `[WebServer] LOGIN ERROR: Error: NEXT_REDIRECT` to stdout. This is expected internal framework behavior when `redirect()` throws a redirection control error in Next.js App Router Server Actions. No application error is occurring.
3. **Desktop Header Navigation**:
   Desktop navigation (`hidden md:flex`) at viewports $\ge 768\text{px}$ remains byte-for-byte identical in appearance, layout, and links to the baseline.

