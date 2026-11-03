# Mobile Horizontal Overflow Diagnosis Report

Generated: 2026-11-03T11:46:04.974Z
Tested Viewports: 320px, 360px, 390px, 412px, 768px
Tested Routes: 12 routes

## Summary Table

| Route | Viewport | ScrollWidth | InnerWidth | Overflow? | Max Overflow (px) |
|---|---|---|---|---|---|
| `/en` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en` | 768px | 875px | 768px | ❌ YES (+107px) | 107px |
| `/en/about` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/about` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/about` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/about` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/about` | 768px | 876px | 768px | ❌ YES (+108px) | 108px |
| `/en/work` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/work` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/work` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/work` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/work` | 768px | 876px | 768px | ❌ YES (+108px) | 108px |
| `/en/work/os-dashboard` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/work/os-dashboard` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/work/os-dashboard` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/work/os-dashboard` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/work/os-dashboard` | 768px | 876px | 768px | ❌ YES (+108px) | 108px |
| `/en/services` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/services` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/services` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/services` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/services` | 768px | 876px | 768px | ❌ YES (+108px) | 108px |
| `/en/services/web-development` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/services/web-development` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/services/web-development` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/services/web-development` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/services/web-development` | 768px | 876px | 768px | ❌ YES (+108px) | 108px |
| `/en/blog` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/blog` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/blog` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/blog` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/blog` | 768px | 875px | 768px | ❌ YES (+107px) | 107px |
| `/en/blog/first-post` | 320px | 327px | 320px | ❌ YES (+7px) | 7px |
| `/en/blog/first-post` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/blog/first-post` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/blog/first-post` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/blog/first-post` | 768px | 875px | 768px | ❌ YES (+107px) | 107px |
| `/en/testimonials` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/testimonials` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/testimonials` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/testimonials` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/testimonials` | 768px | 877px | 768px | ❌ YES (+109px) | 109px |
| `/en/contact` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/contact` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/contact` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/contact` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/contact` | 768px | 876px | 768px | ❌ YES (+108px) | 108px |
| `/en/privacy` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/privacy` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/privacy` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/privacy` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/privacy` | 768px | 875px | 768px | ❌ YES (+107px) | 107px |
| `/en/terms` | 320px | 320px | 320px | ✅ NO | 0px |
| `/en/terms` | 360px | 360px | 360px | ✅ NO | 0px |
| `/en/terms` | 390px | 390px | 390px | ✅ NO | 0px |
| `/en/terms` | 412px | 412px | 412px | ✅ NO | 0px |
| `/en/terms` | 768px | 875px | 768px | ❌ YES (+107px) | 107px |

**Total Viewport Combinations with Overflow: 13 / 60**

## Detailed Element Overflow Breakdown

### Route: `/en` at 768px (Overflow: 107px)

Scroll width: 875px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +107px, width: 260px, right: 875px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +107px, width: 124px, right: 875px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +12px, width: 16px, right: 780px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +69px, width: 54px, right: 837px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +91px, width: 14px, right: 859px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +128px, width: 384px, right: 896px)
  - Classes: `absolute top-1/3 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]`
  - Snippet: `<div class="absolute top-1/3 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]"></div>`

### Route: `/en/about` at 768px (Overflow: 108px)

Scroll width: 876px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +108px, width: 260px, right: 876px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +108px, width: 124px, right: 876px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +11px, width: 13px, right: 779px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +70px, width: 54px, right: 838px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +92px, width: 14px, right: 860px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +128px, width: 384px, right: 896px)
  - Classes: `absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]`
  - Snippet: `<div class="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]"></div>`

### Route: `/en/work` at 768px (Overflow: 108px)

Scroll width: 876px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +108px, width: 260px, right: 876px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +108px, width: 124px, right: 876px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +11px, width: 14px, right: 779px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +70px, width: 54px, right: 838px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +92px, width: 14px, right: 860px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +128px, width: 384px, right: 896px)
  - Classes: `absolute top-1/2 -right-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]`
  - Snippet: `<div class="absolute top-1/2 -right-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]"></div>`

### Route: `/en/work/os-dashboard` at 768px (Overflow: 108px)

Scroll width: 876px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +108px, width: 260px, right: 876px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +108px, width: 124px, right: 876px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +11px, width: 14px, right: 779px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +70px, width: 54px, right: 838px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +92px, width: 14px, right: 860px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +39px, width: 192px, right: 807px)
  - Classes: `pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4F6FF0]/15 blur-3xl`
  - Snippet: `<div class="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4F6FF0]/15 blur-3xl"></div>`

### Route: `/en/services` at 768px (Overflow: 108px)

Scroll width: 876px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +108px, width: 260px, right: 876px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +108px, width: 124px, right: 876px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +11px, width: 13px, right: 779px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +70px, width: 54px, right: 838px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +92px, width: 14px, right: 860px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +128px, width: 384px, right: 896px)
  - Classes: `absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]`
  - Snippet: `<div class="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]"></div>`

### Route: `/en/services/web-development` at 768px (Overflow: 108px)

Scroll width: 876px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +108px, width: 260px, right: 876px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +108px, width: 124px, right: 876px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +11px, width: 14px, right: 779px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +70px, width: 54px, right: 838px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +92px, width: 14px, right: 860px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +39px, width: 192px, right: 807px)
  - Classes: `pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#8063F7]/15 blur-3xl`
  - Snippet: `<div class="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#8063F7]/15 blur-3xl"></div>`

### Route: `/en/blog` at 768px (Overflow: 107px)

Scroll width: 875px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +107px, width: 260px, right: 875px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +107px, width: 124px, right: 875px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +10px, width: 13px, right: 778px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +69px, width: 54px, right: 837px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +91px, width: 14px, right: 859px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +128px, width: 384px, right: 896px)
  - Classes: `absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]`
  - Snippet: `<div class="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]"></div>`

### Route: `/en/blog/first-post` at 320px (Overflow: 7px)

Scroll width: 327px vs Window inner width: 320px

Top offending elements:

- **<button>** (overflow: +7px, width: 87px, right: 327px)
  - Classes: `flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#292D45] bg-[#171D32]/70 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 text-[#A5ABC1] hover:text-[#8063F7] hover:border-[#8063F7]/30`
  - Snippet: `<button aria-label="Share" class="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#292D45] bg-[#171D32]/70 text-xs sm:text-sm font-medium transiti`

### Route: `/en/blog/first-post` at 768px (Overflow: 107px)

Scroll width: 875px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +107px, width: 260px, right: 875px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +107px, width: 124px, right: 875px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +10px, width: 12px, right: 778px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +69px, width: 54px, right: 837px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +91px, width: 14px, right: 859px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 17 17 7"></path>`

### Route: `/en/testimonials` at 768px (Overflow: 109px)

Scroll width: 877px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +109px, width: 260px, right: 877px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +109px, width: 124px, right: 877px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +9px, width: 8px, right: 777px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +11px, width: 11px, right: 779px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +9px, width: 8px, right: 777px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +71px, width: 54px, right: 839px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +93px, width: 14px, right: 861px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +89px, width: 6px, right: 857px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +89px, width: 6px, right: 857px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +128px, width: 384px, right: 896px)
  - Classes: `absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]`
  - Snippet: `<div class="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]"></div>`

### Route: `/en/contact` at 768px (Overflow: 108px)

Scroll width: 876px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +108px, width: 260px, right: 876px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +108px, width: 124px, right: 876px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +11px, width: 13px, right: 779px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +70px, width: 54px, right: 838px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +92px, width: 14px, right: 860px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +88px, width: 6px, right: 856px)
  - Snippet: `<path d="M7 17 17 7"></path>`

- **<div>** (overflow: +128px, width: 384px, right: 896px)
  - Classes: `absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]`
  - Snippet: `<div class="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]"></div>`

### Route: `/en/privacy` at 768px (Overflow: 107px)

Scroll width: 875px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +107px, width: 260px, right: 875px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +107px, width: 124px, right: 875px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +10px, width: 12px, right: 778px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +69px, width: 54px, right: 837px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +91px, width: 14px, right: 859px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 17 17 7"></path>`

### Route: `/en/terms` at 768px (Overflow: 107px)

Scroll width: 875px vs Window inner width: 768px

Top offending elements:

- **<div>** (overflow: +107px, width: 260px, right: 875px)
  - Classes: `hidden md:flex items-center gap-3`
  - Snippet: `<div class="hidden md:flex items-center gap-3"><div class="relative"><button class="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] te`

- **<a>** (overflow: +107px, width: 124px, right: 875px)
  - Classes: `group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95`
  - Snippet: `<a class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative flex h-2 w-2`
  - Snippet: `<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span><s`

- **<span>** (overflow: +9px, width: 12px, right: 777px)
  - Classes: `absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000`
  - Snippet: `<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000"></span>`

- **<span>** (overflow: +8px, width: 8px, right: 776px)
  - Classes: `relative inline-flex h-2 w-2 rounded-full bg-emerald-400`
  - Snippet: `<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>`

- **<span>** (overflow: +69px, width: 54px, right: 837px)
  - Snippet: `<span>Contact</span>`

- **<svg>** (overflow: +91px, width: 14px, right: 859px)
  - Snippet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" str`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 7h10v10"></path>`

- **<path>** (overflow: +87px, width: 6px, right: 855px)
  - Snippet: `<path d="M7 17 17 7"></path>`

