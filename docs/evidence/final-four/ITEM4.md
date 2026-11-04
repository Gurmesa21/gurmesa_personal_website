# ITEM 4: BLOG CARD SIZE = WORK CARD SIZE AUDIT & PLAN

**Target:** Make the blog list page cards' width and height equal to the Work page cards across viewports.

---

## 1. Initial Measurements (Before Fix)

| Viewport | Page | Card Width | Card Height | Grid Columns | Grid Gap | Sizing Classes |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **375px** | **Work** | 343px | 260px | 343px (1 col) | 20px | `grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6`, `min-h-[260px] sm:min-h-[280px]` |
| 375px | Blog | 343px | 240px | 343px (1 col) | 16px | `grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5`, `min-h-[240px] sm:min-h-[260px]` |
| **412px** | **Work** | 380px | 260px | 380px (1 col) | 20px | `grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6`, `min-h-[260px] sm:min-h-[280px]` |
| 412px | Blog | 380px | 240px | 380px (1 col) | 16px | `grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5`, `min-h-[240px] sm:min-h-[260px]` |
| **768px** | **Work** | 348px | 280px | 348px 348px (2 col) | 24px | `grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6`, `min-h-[260px] sm:min-h-[280px]` |
| 768px | Blog | 350px | 260px | 350px 350px (2 col) | 20px | `grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5`, `min-h-[240px] sm:min-h-[260px]` |
| **1280px** | **Work** | 596px | 280px | 596px 596px (2 col) | 24px | `grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6`, `min-h-[260px] sm:min-h-[280px]` |
| 1280px | Blog | 598px | 260px | 598px 598px (2 col) | 20px | `grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5`, `min-h-[240px] sm:min-h-[260px]` |

---

## 2. Analysis & Target Configuration

1. **Height discrepancy:**
   - Work card uses `min-h-[260px] sm:min-h-[280px]`.
   - Blog card currently uses `min-h-[240px] sm:min-h-[260px]`.
   - Result: 20px height difference on all viewports.
2. **Width / Gap discrepancy at 768px & 1280px:**
   - Work grid uses `gap-5 sm:gap-6` (20px on mobile, 24px on tablet/desktop).
   - Blog grid currently uses `gap-4 sm:gap-5` (16px on mobile, 20px on tablet/desktop).
   - Result: 2px difference in column width (`(Container - 20) / 2 = 350px` vs `(Container - 24) / 2 = 348px`).

### Target Fix for `app/[locale]/(public)/blog/page.tsx`
- Grid container: change `gap-4 sm:gap-5` to `gap-5 sm:gap-6`.
- Card container: change `min-h-[240px] sm:min-h-[260px]` to `min-h-[260px] sm:min-h-[280px]`.
- No other changes to blog card typography, content, footer, or layout.
- Strictly limited to `app/[locale]/(public)/blog/page.tsx` (the blog list page).

