# ROLLBACK AND FIX PLAN: RESTORING BACKGROUND-MEDIA CARD DESIGN

**Date:** November 4, 2026  
**Target:** Restore the single-card background-media architecture across all public list pages while fixing media fit, letterboxing, and row footer baseline alignment.

---

## 1. File-by-File Decision Matrix

| File Path | Status | Action | Detailed Reason |
| :--- | :--- | :--- | :--- |
| `components/ui/MediaFrame.tsx` | Redesign | **DELETE** | Separate 16:9 top media block is removed; media returns to being the card background layer. |
| `components/ui/CardVideo.tsx` | Redesign | **DELETE** | Standalone video frame component is removed; video plays as background inside the card shell. |
| `components/ui/ContentCard.tsx` | Redesign | **REWRITE** | Rewritten as the single shared background-media card shell (`relative isolate flex flex-col h-full ...`). Contains the absolute background media layer (`object-cover` without letterboxing), subtle dark gradient overlay for text readability, `flex-1` content wrapper, and `mt-auto` footer. |
| `app/[locale]/(public)/page.tsx` | Mixed | **ROLL BACK / UPDATE** | Restores background-media cards for Home Services and Featured Work. Preserves Home Blog and Testimonials cards. Ensures grid row footer alignment. |
| `app/[locale]/(public)/services/page.tsx` | Mixed | **ROLL BACK / UPDATE** | Restores background-media cards for Services list. Keeps `viewDetails` `<Link>` CTA and starting price wrapping. |
| `app/[locale]/(public)/work/page.tsx` | Mixed | **ROLL BACK / UPDATE** | Restores background-media cards for Work list. Keeps `readCaseStudy` `<Link>` CTA and technology badge chips. |
| `app/[locale]/(public)/blog/page.tsx` | Mixed | **ROLL BACK / UPDATE** | Restores background-media cards for Blog list. Keeps date, category, reading time, interaction buttons, and `readArticle` `<Link>` CTA. |
| `app/[locale]/(public)/about/page.tsx` | Previous | **KEEP** | Keeps `LanyardBadge` with `size="about"` (`w-48 h-48` container for avatar upload test compliance) and dynamic-width social link pills. |
| `components/home/LanyardBadge.tsx` | Previous | **KEEP** | Keeps lanyard hero badge, physics interactions, `size="about"` variant, and WCAG AA contrast colors (`#C4B5FD` / `#CBD5E1`). |
| `app/mock-storage/[...path]/route.ts` | Infrastructure | **KEEP** | Byte-range support for mock storage video streaming in local/CI test runs. |
| `tests/e2e/cards-mobile.spec.ts` | Test | **UPDATE** | Replaces separate-frame assertions with background-media verification (`object-cover`, media behind text, zero letterboxing) and adds footer baseline 1px alignment assertion across viewports (375, 768, 1280). |
| `tests/e2e/mobile-responsive.spec.ts` | Test | **KEEP** | 120/120 mobile responsive viewport checks across all public routes. |
| `tests/e2e/stability.spec.ts` | Test | **KEEP** | Focus/blur/visibility stability tests. |

---

## 2. Technical Solution for Background Media Fit & Footer Alignment

1. **Perfect Media Fit (Eliminating Letterboxing & Black Side Bars):**
   - Media container is `pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#080B16]`.
   - Images and videos use `w-full h-full object-cover object-center` (with fill/absolute layout).
   - This ensures the media fills 100% of the card area seamlessly regardless of card aspect ratio, eliminating the black letterbox sidebars that occurred when `object-contain` was previously used.
   - Gradient overlay: `absolute inset-0 bg-gradient-to-t from-[#080B16]/95 via-[#080B16]/80 to-[#080B16]/45 group-hover:via-[#080B16]/70 group-hover:to-[#080B16]/35 transition-all duration-300` guarantees high text contrast and legibility while letting the media shine through.

2. **Row Footer Baseline Alignment:**
   - Card root: `relative isolate flex flex-col h-full ...`.
   - Content wrapper: `relative z-10 flex flex-col flex-1 justify-between space-y-4`.
   - Footer: `mt-auto pt-3 border-t border-[#292D45]/60 flex items-center justify-between`.
   - Within each grid row, cards match heights and footers align to the exact same baseline ($\le 1\text{px}$ difference).

