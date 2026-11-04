# ITEM 3: TOUCH EFFECTS INVESTIGATION & ARCHITECTURE

**Target:** Re-implement touch/hover effects as additive-only enhancements without modifying layout geometry or causing layout shifts.

---

## 1. Git History Investigation

1. **Commit `a4b559c` ("Fix: post deployment update")**:
   - Introduced `components/utils/TouchHighlightManager.tsx`.
   - Used scroll/resize listeners with `requestAnimationFrame` polling every card and calculating distance to viewport center (`window.innerHeight / 2`).
   - Attached `data-inview="true"` to the closest card within 45% of viewport center.
   - In `app/globals.css`:
     - Added `@media (hover: none) and (pointer: coarse)` rules:
       - `[data-card]:active { transform: scale(0.98); border-color: rgba(128, 99, 247, 0.7); }`
       - `[data-card][data-inview="true"] { border-color: rgba(128, 99, 247, 0.65); box-shadow: 0 10px 30px -5px rgba(128, 99, 247, 0.2); }`
       - `touch-action: manipulation; -webkit-tap-highlight-color: transparent;` on button, a, [role="button"], [data-card].
2. **Current Tree Status**:
   - `data-card` is present on `ContentCard.tsx` and testimonial cards.
   - `-webkit-tap-highlight-color: transparent` remains on `.touch-feedback` and `animated-card` in `globals.css`.
   - Active scaling and `data-inview` rules were previously removed during layout cleanup.

---

## 2. Re-Implementation Plan (Additive Only)

### A. Hover Effects for Pointer Devices (`@media (hover: hover)`)
- Card border highlight: `border-color: rgba(128, 99, 247, 0.7)` and subtle glow `box-shadow: 0 10px 30px -5px rgba(128, 99, 247, 0.25)`.
- Card elevation: `transform: translateY(-2px)`.
- Background media scale: `scale(1.04)` on the background media layer `[data-card-media-bg] > img, [data-card-media-bg] > video` (clipped by card shell's `overflow-hidden`).
- Overlay gradient slight lightening.
- Under `@media (prefers-reduced-motion: reduce)`: disable `translateY` and `scale`; keep color/border transitions only.

### B. Press Feedback (`:active`)
- On cards, buttons, links, pills, nav rows, menu button:
  - `:active` applies `transform: scale(0.98)` and brief subtle glow with `150ms` transition.
  - Under `prefers-reduced-motion`: no scale.

### C. Touch In-View Highlight (`IntersectionObserver`)
- Tiny client hook / component mounted in `app/[locale]/(public)/layout.tsx`: [`components/utils/TouchHighlightManager.tsx`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/components/utils/TouchHighlightManager.tsx).
- Runs only when `window.matchMedia('(hover: none)').matches`.
- Uses a single shared `IntersectionObserver` with `rootMargin: '-35% 0px -35% 0px'`.
- Tracks intersecting elements with `[data-card]`, identifies the card closest to the vertical center, and sets `data-inview="true"` directly via `element.setAttribute('data-inview', 'true')` (removing it from any previous card).
- Zero React state, zero component re-renders, zero layout thrashing.
- In CSS under `@media (hover: none)`:
  - `[data-card][data-inview="true"]` applies the exact same border and glow as desktop hover (`border-color: rgba(128, 99, 247, 0.7); box-shadow: 0 10px 30px -5px rgba(128, 99, 247, 0.25);`).

### D. Tap Highlight & Touch Action
- `-webkit-tap-highlight-color: transparent; touch-action: manipulation;` on interactive cards, links, and buttons.
- Never on `*`, `body`, `main`, `section`, or layout containers.

### E. Text Selection Highlight
- `::selection { background-color: rgb(99 102 241 / 0.45); color: #FFFFFF; }` site-wide in `app/globals.css`.

### F. Focus-Visible Rings
- `focus-visible:ring-2 focus-visible:ring-[#8063F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B16] focus-visible:outline-none` on buttons, links, and cards.

