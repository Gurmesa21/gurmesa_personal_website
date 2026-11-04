# ITEM 1: ROOT CAUSE INVESTIGATION & RESOLUTION

**Target:** Mobile menu button icon invisibility on phone viewports (<1024px).

---

## 1. Investigation & Root Cause Identification

### Primary Root Cause
- **File & Line:** [`components/layout/header.tsx:135-139`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/components/layout/header.tsx#L135-L139) & [`app/globals.css:173-175`](file:///c:/Users/Hp/Documents/Projects/Gurmesa_website/app/globals.css#L173-L175)
- In `components/layout/header.tsx`:
  ```tsx
  <Button variant="ghost" className={cn("h-11 w-11 p-2 text-base hover:bg-[#171D32]/50 focus-visible:bg-[#171D32]/50 focus-visible:ring-0 focus-visible:ring-offset-0", isHomePage && "text-[#F5F6FC]")}>
    <Menu className="h-6 w-6" />
    <span className="sr-only">Toggle Menu</span>
  </Button>
  ```
- In `app/globals.css`:
  ```css
  .btn {
    @apply inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 font-medium transition-all ...;
  }
  ```
- In `components/ui/button.tsx`:
  - `buttonVariants` applies base class `btn` with default size `h-11 px-6 py-2`.
  - Because `size="icon"` was omitted in `header.tsx`, the base `btn` and default size utility applied `px-6` (`padding-left: 24px; padding-right: 24px`).
  - Total horizontal padding = `24px + 24px = 48px`.
  - The button container has width `48px` (`w-11` or `h-11`).
  - **Available content width inside button = `48px - 48px = 0px`!**
  - Because `<Menu className="h-6 w-6" />` had `flex-shrink: 1` and lacked `shrink-0`, the flexbox engine crushed the SVG from 24px down to `width: 0px` (`svgBox: { width: 0, height: 24 }`).
  - An SVG element with `width: 0px` is completely invisible, despite having valid paths and stroke attributes.

### Secondary Factors Checked
1. **Button icon color vs header background**:
   - `header.tsx:135` used `isHomePage && "text-[#F5F6FC]"`.
   - On non-home routes (`/services`, `/work`, `/blog`, `/about`, `/contact`), `isHomePage` was false.
   - While `.btn-tertiary` has `text-foreground`, relying on conditional home-page logic created inconsistent color inheritance.
2. **Overlay / z-index**:
   - Z-index of header is `z-40`, correctly layered above page content.
3. **Display / visibility**:
   - The `<button>` element was visible and interactive with bounding box `48x44 px`, which is why tapping its place opened the menu.
4. **SVG attributes**:
   - SVG had valid `viewBox="0 0 24 24"` and paths, but rendered box was `0x24 px` due to flex compression.

---

## 2. Root Cause Fix

1. **Size & Padding Elimination**:
   - Explicitly pass `size="icon"` and remove conflicting `px-6` padding via `p-2.5` / `!p-0`.
2. **Prevent SVG Shrinkage**:
   - Add `shrink-0` and explicit `w-6 h-6` to `<Menu className="h-6 w-6 shrink-0" />`.
3. **Explicit High-Contrast Color**:
   - Ensure explicit white/near-white text color `text-[#F5F6FC]` with `stroke="currentColor"`.
4. **Accessibility Attributes**:
   - Translated `aria-label` using `t('toggleMenu')` across `en`, `am`, and `om`.
   - `aria-expanded={isOpen}` and `aria-controls="mobile-nav-panel"`.
   - Minimum tap target: `44x44 px` (`h-11 w-11`).

