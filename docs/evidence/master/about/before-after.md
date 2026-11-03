# About Page Profile Image Card: Baseline (0e92384) vs Current (HEAD)

## 1. Specification & Comparison

| Property | Baseline (0e92384) | Current (HEAD before Part 2) | Target (Restored Baseline) |
|---|---|---|---|
| **Grid Column** | `md:col-span-5 lg:col-span-4` | `md:col-span-5 lg:col-span-4` | `md:col-span-5 lg:col-span-4` (Preserve) |
| **Grid Alignment** | `flex flex-col items-center justify-center` | `flex flex-col items-center justify-center` | `flex flex-col items-center justify-center` (Preserve) |
| **Relative Placement** | Left of profile text on desktop (`md:`+), stacked above text on mobile (`<md`) | Left of profile text on desktop, stacked above text on mobile | Left on desktop, stacked above on mobile (Preserve) |
| **Sticky Status** | Non-sticky | Non-sticky | Non-sticky (Preserve) |
| **Outer Card Width/Height** | `relative w-48 h-48 md:w-full md:h-auto max-w-[280px] sm:max-w-[320px] md:max-w-none aspect-[3/4]` | `relative w-48 h-48 sm:w-56 sm:h-56` | `relative w-48 h-48 md:w-full md:h-auto max-w-[280px] sm:max-w-[320px] md:max-w-none aspect-[3/4]` |
| **Aspect Ratio** | `aspect-[3/4]` outer card | None (fixed square `w-48 h-48 sm:w-56 sm:h-56`) | `aspect-[3/4]` outer card |
| **Border Radius** | `rounded-2xl` | `rounded-2xl` | `rounded-2xl` |
| **Outer Padding** | None (0) | `p-2` | None (0) |
| **Background & Border** | `border border-[#8063F7]/40 bg-[#171D32]` | `border border-[#8063F7]/40 bg-[#171D32]` | `border border-[#8063F7]/40 bg-[#171D32]` |
| **Inner Media Frame** | Rendered directly inside `aspect-[3/4]` | Inner frame `aspect-[9/16] h-full max-h-full` | Inner frame `relative h-full aspect-[9/16] max-h-full max-w-full flex items-center justify-center overflow-hidden bg-[#080B16]` |
| **Image Fit** | `object-cover` (in baseline) | `object-contain` in 9:16 frame | `object-contain` centered in 9:16 vertical frame (shows full 9:16 photo without cropping) |
| **Intrinsic Dimensions** | `fill` | `fill` | `fill` with `sizes="(max-width: 640px) 192px, (max-width: 1024px) 320px, 400px"` |

---

## 2. Calculated Bounding Box Across Breakpoints

| Viewport Width | Outer Container Classes | Expected Bounding Box | Image Fit | Full Photo Visible |
|---|---|---|---|---|
| **375px (Mobile)** | `w-48 h-48 aspect-[3/4]` | 192px × 192px | `contain` inside 9:16 frame (~108px × 192px) | Yes, 100% visible, no crop |
| **768px (Tablet)** | `md:w-full md:h-auto aspect-[3/4]` | ~275px × 367px | `contain` inside 9:16 frame (~206px × 367px) | Yes, 100% visible, no crop |
| **1280px (Desktop)** | `lg:col-span-4 md:w-full md:h-auto aspect-[3/4]` | ~380px × 507px | `contain` inside 9:16 frame (~285px × 507px) | Yes, 100% visible, no crop |

