# AUDIT OF CARDS, MEDIA STRUCTURE, AND RESPONSIVE DEFECTS

**Audit Date:** November 4, 2026  
**Artifact Baseline Commit:** `0e92384`  
**Execution Environment:** Production Build (`next build && next start -p 3006`, `APP_ENV=test`, local Docker DB/Redis)

---

## 1. Inventory of Card & Media Components

| Section / Page | File Path | Parent Grid / Container | Current Root Classes | Media Presentation Method |
| :--- | :--- | :--- | :--- | :--- |
| **Home Hero** | `app/[locale]/(public)/page.tsx` (L314-420) | `grid-cols-1 lg:grid-cols-[13fr_7fr]` (Left column) | `group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-xl` | `LanyardBadge` hanging from top edge |
| **Home Services** | `app/[locale]/(public)/page.tsx` (L448-527) | `grid grid-cols-1 sm:grid-cols-2 gap-3.5` (inside Left column) | `group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#292D45] bg-[#101426] p-4.5 sm:p-5 aspect-video` | `absolute inset-0 z-0` background layer behind card text; letterboxed with `object-contain` |
| **Home Featured Work** | `app/[locale]/(public)/page.tsx` (L561-654) | `flex flex-col gap-3.5 items-stretch` (Right column `aside`, ~35% width) | `group relative flex flex-col h-full justify-between overflow-hidden rounded-xl border border-[#292D45] bg-[#101426] p-4 sm:p-5` | `absolute inset-0 z-0` background layer behind card text; letterboxed with `object-contain` |
| **Home Blog** | `app/[locale]/(public)/page.tsx` (L669-738) | `grid grid-cols-1 md:grid-cols-3 gap-5` (Bottom row card 1) | `group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg` | Inner mini post items (`p-2.5 rounded-xl border border-[#292D45]/80 bg-[#171D32]/60`) without media |
| **Home About Summary** | `app/[locale]/(public)/page.tsx` (L743-800) | `grid grid-cols-1 md:grid-cols-3 gap-5` (Bottom row card 2) | `group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg` | Header avatar icon (`w-8 h-8 rounded-full`) |
| **Home Testimonials Summary** | `app/[locale]/(public)/page.tsx` (L805-870) | `grid grid-cols-1 md:grid-cols-3 gap-5` (Bottom row card 3) | `group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg` | Quote block without media |
| **Services List Page** | `app/[locale]/(public)/services/page.tsx` (L118-204) | `grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6` | `group relative flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-6 min-h-[260px] sm:min-h-[280px] overflow-hidden` | `absolute inset-0 z-0` background layer behind card text; letterboxed with `object-contain` |
| **Work List Page** | `app/[locale]/(public)/work/page.tsx` (L161-255) | `grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6` | `group relative flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-6 overflow-hidden aspect-video` | `absolute inset-0 z-0` background layer behind card text; letterboxed with `object-contain` |
| **Blog List Page** | `app/[locale]/(public)/blog/page.tsx` (L112-205) | `grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5` | `group relative flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-6 min-h-[240px] sm:min-h-[260px] overflow-hidden` | `absolute inset-0 z-0` background layer behind card text; letterboxed with `object-contain` |
| **About Profile Card** | `app/[locale]/(public)/about/page.tsx` (L142-166) | `grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10` | `relative w-48 h-48 md:w-full md:h-auto max-w-[280px] sm:max-w-[320px] md:max-w-none aspect-[3/4] rounded-2xl overflow-hidden border border-[#8063F7]/40 bg-[#171D32]` | Inner `aspect-[9/16]` container with `[object-fit:contain_!important]`, creating dark letterbox bars |
| **Testimonials Page** | `app/[locale]/(public)/testimonials/page.tsx` | `grid grid-cols-1 md:grid-cols-2 gap-5` | `rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-xl` | Avatar thumbnail in testimonial author info |
| **Service Slug Detail Banner** | `app/[locale]/(public)/services/[slug]/page.tsx` (L117-138) | Max-width container (`max-w-[1280px] w-full mx-auto`) | `relative max-w-[1280px] w-full mx-auto aspect-video rounded-2xl overflow-hidden border border-[#292D45] bg-[#080B16] shadow-2xl` | `MediaRenderer` with `object-contain bg-[#080B16]` |
| **Work Slug Detail Banner** | `app/[locale]/(public)/work/[slug]/page.tsx` (L144-165) | Max-width container (`max-w-[1280px] w-full mx-auto`) | `relative max-w-[1280px] w-full mx-auto aspect-video rounded-2xl overflow-hidden border border-[#292D45] bg-[#080B16] shadow-2xl` | `MediaRenderer` with `object-contain bg-[#080B16]` |
| **Blog Slug Detail Banner** | `components/blog/BlogPostClientView.tsx` (L482-495) | Max-width container (`max-w-[1280px] w-full mx-auto`) | `relative max-w-[1280px] w-full mx-auto aspect-video rounded-2xl overflow-hidden border border-[#292D45] bg-[#080B16] shadow-2xl` | `MediaRenderer` with `object-contain bg-[#080B16]` |

---

## 2. Card Dimensions Measurements Across Viewports

Measurements recorded from the live production bundle in `docs/evidence/cards/measurements.json`:

| Viewport Width | Component | Card Width | Card Height | Grid Columns | Gap | Padding |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **375px** | **Home Service Card** | 343px | 193px | 1 col (343px) | 14px | 18px (`p-4.5`) |
| | **Home Featured Work** | 343px | 145px | 1 col (343px) | 14px | 16px (`p-4`) |
| | **Work Page Card** | 343px | 193px | 1 col (343px) | 20px | 20px (`p-5`) |
| **412px** | **Home Service Card** | 380px | 214px | 1 col (380px) | 14px | 18px (`p-4.5`) |
| | **Home Featured Work** | 380px | 145px | 1 col (380px) | 14px | 16px (`p-4`) |
| | **Work Page Card** | 380px | 214px | 1 col (380px) | 20px | 20px (`p-5`) |
| **768px** | **Home Service Card** | 353px | 199px | 2 cols (353px 353px) | 14px | 20px (`sm:p-5`) |
| | **Home Featured Work** | 720px | 156px | 1 col (720px) | 14px | 20px (`sm:p-5`) |
| | **Work Page Card** | 348px | 196px | 2 cols (348px 348px) | 24px | 24px (`sm:p-6`) |
| **1280px** | **Home Service Card** | 382px | 215px | 2 cols (~382px) | 14px | 20px (`sm:p-5`) |
| | **Home Featured Work** | 419px | 156px | 1 col (~419px) | 14px | 20px (`sm:p-5`) |
| | **Work Page Card** | 596px | 335px | 2 cols (596px 596px) | 24px | 24px (`sm:p-6`) |

### Key Discrepancies Identified:
1. **Unequal Desktop Widths (Home):** At 1280px, the Home Service Card is **382px**, whereas the Featured Work Card is **419px** (a 37px difference due to `13fr_7fr` split instead of a shared 3-column grid).
2. **Unequal Tablet Layout (Home):** At 768px, the Featured Work card stretches across **720px** full width, while the service cards are in 2 columns of **353px**.
3. **Disparate Page Grids:** Services, Work, and Blog pages currently use `md:grid-cols-2` (2 columns) with 596px card width on desktop, instead of the unified `sm:grid-cols-2 lg:grid-cols-3` 3-column system.
4. **Different Card Heights:** Work cards use `aspect-video` (rigid ~193px height on mobile), while Service and Blog cards use `min-h-[260px]`/`min-h-[240px]`.

---

## 3. Visual Defects Observed in "Before" Screenshots

All 90 screenshots captured in `docs/evidence/cards/shots-before/` were inspected:

### Defect 1: Media as Background Layer Overlapping Text
- **Routes:** `/`, `/services`, `/work`, `/blog` (all viewports)
- **Selector:** `[data-card] > div.pointer-events-none.absolute.inset-0`
- **Issue:** The media (image/video) is rendered as an absolute background layer directly behind headings, descriptions, and metadata. When an image has contrast, text readability is compromised despite dark gradient overlays.
- **Evidence:** `home-en-360px.png`, `services-en-412px.png`, `work-en-390px.png`.

### Defect 2: Black Side Bars (Letterboxing) on Non-16:9 Media
- **Routes:** `/services`, `/work`, `/blog` (all viewports)
- **Selector:** `[data-card] img`, `[data-card] video`
- **Issue:** Because `object-contain` is used on images and videos with 4:3, 1:1, or 9:16 aspect ratios, black letterbox sidebars appear inside the card. Every card looks inconsistent.
- **Evidence:** `work-en-412px.png` (cards with 4:3 and 9:16 fixtures have black side gutters).

### Defect 3: Clipped Footers and Cramped Chips in Work Cards
- **Routes:** `/`, `/work` (360px, 375px, 390px, 412px)
- **Selector:** `aside[aria-label="Featured Work"] [data-card] div.mt-auto`
- **Issue:** On the Home featured work card, the tag chips wrap onto two lines. Because the card height is constrained or lacking vertical room, the bottom chip is clipped by the card's bottom border or crowded against the "Read Case Study" CTA.
- **Evidence:** `home-en-375px.png`, `home-en-412px.png`.

### Defect 4: Service Card Price & CTA Button Collision
- **Routes:** `/services` (360px, 375px, 412px)
- **Selector:** `[data-card] .border-t .text-xs` colliding with `a[href*="/services/"]`
- **Issue:** The starting price text ("Starting at ETB 1,500 per session") sits in an un-wrapped `flex items-center justify-between` container next to the "View Details" button. At 360px–412px, the price text collides with and touches the button edge.
- **Evidence:** `services-en-360px.png`, `services-en-375px.png`.

### Defect 5: About Profile Card Letterbox Bars
- **Routes:** `/about`, `/am/about`, `/om/about` (all viewports)
- **Selector:** `[data-testid="profile-image-frame-9-16"]` inside `[data-testid="about-profile-card"]`
- **Issue:** The profile card displays a vertical photo inside an `aspect-[3/4]` card with `[object-fit:contain_!important]`, resulting in vertical dark bars on either side of the portrait.
- **Evidence:** `about-en-375px.png`, `about-en-412px.png`, `about-en-768px.png`.

### Defect 6: Cards Oversized or Uneven Across Pages
- **Routes:** `/services`, `/work`, `/blog` at 1280px desktop
- **Selector:** `.grid.grid-cols-1.md:grid-cols-2`
- **Issue:** Cards on `/services`, `/work`, and `/blog` span 596px width on 1280px desktops (2-column layout), appearing excessively wide and completely disparate from Home cards (~382px).
- **Evidence:** `services-en-768px.png`, `work-en-768px.png`.

---

## 4. Root Causes to Remove

1. **Eliminate Background Media Layer:** Replace all `absolute inset-0` background media layers with a dedicated top-positioned `MediaFrame` component. Media must sit above the card content and never overlap text.
2. **Enforce `object-cover` in 16:9 Frame:** The 16:9 frame dimensions must come strictly from `aspect-video` on the wrapper, and media must use `object-cover` (with `center top` for portrait media) to completely fill the frame without black bars.
3. **Flexible Content Height:** Cards must never use `aspect-video` or rigid `min-h` on the root article; card height must follow content naturally with `h-full flex flex-col`.
4. **Footer Wrapping:** Card footers must use `flex-wrap items-center justify-between gap-x-3 gap-y-2` with `min-w-0` on metadata and `shrink-0` on CTA buttons, allowing price and CTA to wrap cleanly onto two lines on narrow screens.
5. **Unified Grid:** Align Services, Work, and Blog pages to `grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-y-6`.
6. **Lanyard Badge on About Page:** Replace the letterboxed photo box on the About page with the reusable `LanyardBadge` hanging from the card top edge.

