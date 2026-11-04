# Card & Media Frame Architecture, About Profile Badge, and Mobile-First CSS Sweep Report

## 1. Executive Summary

This report documents the implementation and verification of the unified Card & Media Frame architecture, the About profile LanyardBadge integration, and the mobile-first responsive sweep across the AVENOR portfolio.

All 5 verification gates passed without regressions or flakiness:
- **Lint**: 0 errors (`docs/evidence/cards/01-lint.txt`)
- **Typecheck**: 0 errors (`docs/evidence/cards/02-typecheck.txt`)
- **Build**: 31/31 routes compiled and generated (`docs/evidence/cards/03-build.txt`)
- **Vitest**: 35 test files passed, 231 tests passed, 0 failures (`docs/evidence/cards/04-vitest.txt`)
- **Playwright Run 1**: 126 tests passed, 0 failures (`docs/evidence/cards/05-playwright-run1.txt`)
- **Playwright Run 2**: 126 tests passed, 0 failures back-to-back (`docs/evidence/cards/06-playwright-run2.txt`)

---

## 2. Before vs After Measurements

All measurements were captured using automated headless Chromium at viewports 375px, 412px, 768px, and 1280px.

| Viewport | Component / Metric | Before Fix | After Fix | Delta / Status |
| :--- | :--- | :--- | :--- | :--- |
| **1280px** | Home Service Card Width | 382 px | 392 px | Matched to Featured Work (+10px) |
| **1280px** | Home Featured Work Card Width | 419 px | 392 px | Matched to Service Card (-27px) |
| **1280px** | Width Discrepancy (Home) | **37 px** | **0 px (Exact Match)** | **Unified Grid (3 equal columns)** |
| **1280px** | Work Page Card Width | 596 px (2-col) | 395 px (3-col) | Balanced 3-column desktop layout |
| **1280px** | Services Page Card Width | 596 px (2-col) | 395 px (3-col) | Balanced 3-column desktop layout |
| **1280px** | Blog Page Card Width | 596 px (2-col) | 395 px (3-col) | Balanced 3-column desktop layout |
| **768px** | Home Service Card Width | 350 px | 350 px | Preserved 2-column layout |
| **768px** | Work Page Card Width | 352 px | 352 px | Preserved 2-column layout |
| **412px** | Home Service Card Width | 380 px | 380 px | Full-bleed phone column |
| **412px** | Home Featured Work Card Width | 380 px | 380 px | Full-bleed phone column |
| **412px** | Work Page Card Width | 380 px | 380 px | Full-bleed phone column |
| **375px** | Home Service Card Width | 343 px | 343 px | Full-bleed phone column |
| **375px** | Home Featured Work Card Width | 343 px | 343 px | Full-bleed phone column |
| **375px** | Work Page Card Width | 343 px | 343 px | Full-bleed phone column |

---

## 3. Defects Resolved

1. **Text Over Media & Contrast Issues**:
   - *Before*: Media rendered as `absolute inset-0 z-0` background layers behind text, making titles and descriptions unreadable over complex photography or video.
   - *After*: `ContentCard` places `MediaFrame` at the top of the card in normal document flow. Media never sits behind text.

2. **Letterbox Bars & Non-16:9 Distortions**:
   - *Before*: `object-contain` on background layers created uneven black bars on images with aspect ratios other than 16:9.
   - *After*: `MediaFrame` enforces a strict 16:9 aspect ratio (`aspect-video`) with `next/image` (`fill`, `object-cover`, `object-position: center top`) for portrait media so faces remain visible without side bars.

3. **Footer Chip Clipping & Card Height Collisions**:
   - *Before*: Cards with fixed or aspect-ratio constraints clipped footer tags and action buttons at the bottom.
   - *After*: `ContentCard` uses `flex flex-col h-full` where the card body expands (`flex-1`) and the footer is pinned with `mt-auto pt-3 border-t`. Footer elements wrap gracefully (`flex-wrap gap-x-3 gap-y-2`) with `min-w-0` on left meta and `shrink-0` on action buttons.

4. **Home Page Layout Asymmetry**:
   - *Before*: Home grid used `13fr_7fr`, creating an arbitrary width difference of 37px between Service cards (382px) and Featured Work cards (419px).
   - *After*: Home desktop grid is structured as `grid-cols-1 lg:grid-cols-3 gap-5`. Hero developer introduction spans 2 columns, Featured Work spans 1 column (`lg:col-span-1`), and Services section spans 2 columns (`lg:col-span-2`) containing a 2-subcolumn grid (`grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5`). Each card is exactly 1 column cell wide (392px at 1280px).

5. **About Page Profile Photo Presentation**:
   - *Before*: The About page profile image was rendered inside a letterboxed 9:16 frame.
   - *After*: Integrated `LanyardBadge` with `size="about"` hanging from the top edge of the profile card container (`relative overflow-clip`, max-width 240px mobile up to 280-300px desktop). Updated admin hint and warnings in `ProfileForm.tsx` and all 3 locale dictionaries (`en`, `am`, `om`).

6. **About Page Social Media Cards Width**:
   - *Before*: Social media links expanded to full container width on desktop.
   - *After*: Social links use `w-auto max-w-full inline-flex` inside an `items-start` flex column, dynamically sizing to their content and label length.

7. **Mobile Tap Target Integrity**:
   - *Before*: Mobile menu button and navigation links lacked guaranteed 44x44px minimum tap targets.
   - *After*: Header mobile trigger updated to `h-11 w-11 p-2` (44x44px), drawer navigation links updated to `min-h-[44px]`, and language selection buttons updated to `min-h-[44px]`.

---

## 4. Architectural Summary

### `components/ui/MediaFrame.tsx`
- Server component rendering a consistent 16:9 aspect frame (`aspect-video`) with rounded top corners.
- Uses `next/image` with `fill`, `object-cover`, and responsive sizes attribute (`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`).
- For portrait-oriented images, applies `object-position: center top` to keep facial features centered without cropping heads.
- Integrates `<CardVideo>` for video media assets (autoplay/loop/muted with IntersectionObserver pause when off-screen and respect for `prefers-reduced-motion`).
- Renders a styled Lucide section icon fallback when no media is assigned.

### `components/ui/ContentCard.tsx`
- Polymorphic semantic `<article data-card>` wrapper.
- Structured with:
  1. Top `MediaFrame` (full bleed to card edges).
  2. Body container (`flex flex-1 flex-col gap-3 p-4 sm:p-5`).
  3. Meta row (icon and role badge).
  4. Heading (`<h3>`) with accessible link, `break-words`, and `line-clamp-2`.
  5. Description paragraph with `text-[#A5ABC1]` and `line-clamp-3`.
  6. Pinned wrapping footer (`mt-auto border-t border-[#292D45]/60 pt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2`).

### Grid Modernization Across Public Pages
- `/services`: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 items-stretch`
- `/work`: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 items-stretch`
- `/blog`: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 items-stretch`
- `/` (Home): 3-column desktop grid aligning Service cards and Featured Work cards to identical width.

---

## 5. Automated Test & Evidence Files

- `docs/evidence/cards/measurements.json`: Pre-refactoring bounding boxes and grid styles.
- `docs/evidence/cards/measurements-after.json`: Post-refactoring measurements proving equal widths.
- `docs/evidence/cards/AUDIT.md`: Pre-implementation defect audit.
- `docs/evidence/cards/01-lint.txt`: ESLint run output (0 errors).
- `docs/evidence/cards/02-typecheck.txt`: TypeScript compilation output (0 errors).
- `docs/evidence/cards/03-build.txt`: Production Next.js build output (31 routes).
- `docs/evidence/cards/04-vitest.txt`: Unit and integration test suite output (231 tests passed).
- `docs/evidence/cards/05-playwright-run1.txt`: Playwright E2E Run 1 (126 tests passed).
- `docs/evidence/cards/06-playwright-run2.txt`: Playwright E2E Run 2 (126 tests passed).
- `docs/evidence/cards/shots-before/`: 90 full-page screenshots before changes.
- `docs/evidence/cards/shots-after/`: 90 full-page screenshots after changes.

