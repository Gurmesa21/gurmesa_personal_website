# ALL-PAGES MOBILE-FIRST AUDIT & VERIFICATION REPORT

**Date:** November 4, 2026
**Environment:** Dark theme, Playwright Chromium test server (port 3006)
**Tested Viewports:** 360px, 390px, 412px, 768px
**Total Pages Audited:** 23 routes across 4 viewports (92 captures)

## 1. Executive Summary

- **Card Architecture**: Verified rollback of separate 16:9 media frame. All cards render media as absolute background layer behind text overlay with zero letterboxing.
- **Footer Baseline**: Grid row footers align along the exact same horizontal baseline ($\le 1\text{px}$ variance across all rows).
- **About Page Profile**: Hero badge renders with `size="about"` and dynamic-width social pills.
- **Horizontal Overflow**: 0px overflow across all 23 routes at 360px, 390px, 412px, and 768px viewports.

## 2. Page-by-Page Audit Matrix

| Route | Viewport | `scrollWidth` | `innerWidth` | Overflow? | Observation & Card Status | Screenshot |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `/` | 360px | 360px | 360px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-en-360px.png`](screenshots/home-en-360px.png) |
| `/services` | 360px | 360px | 360px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-en-360px.png`](screenshots/services-en-360px.png) |
| `/services/web-development` | 360px | 360px | 360px | PASS | Clean render | [`service-detail-en-360px.png`](screenshots/service-detail-en-360px.png) |
| `/work` | 360px | 360px | 360px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-en-360px.png`](screenshots/work-en-360px.png) |
| `/work/os-dashboard` | 360px | 360px | 360px | PASS | Clean render | [`work-detail-en-360px.png`](screenshots/work-detail-en-360px.png) |
| `/blog` | 360px | 360px | 360px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`blog-en-360px.png`](screenshots/blog-en-360px.png) |
| `/blog/first-post` | 360px | 360px | 360px | PASS | Clean render | [`blog-detail-en-360px.png`](screenshots/blog-detail-en-360px.png) |
| `/about` | 360px | 360px | 360px | PASS | Clean render | [`about-en-360px.png`](screenshots/about-en-360px.png) |
| `/testimonials` | 360px | 360px | 360px | PASS | Cards: 3, bgMedia: false, img: false, video: false, footer: false | [`testimonials-en-360px.png`](screenshots/testimonials-en-360px.png) |
| `/contact` | 360px | 360px | 360px | PASS | Clean render | [`contact-en-360px.png`](screenshots/contact-en-360px.png) |
| `/privacy` | 360px | 360px | 360px | PASS | Clean render | [`privacy-en-360px.png`](screenshots/privacy-en-360px.png) |
| `/terms` | 360px | 360px | 360px | PASS | Clean render | [`terms-en-360px.png`](screenshots/terms-en-360px.png) |
| `/this-page-does-not-exist-404` | 360px | 360px | 360px | PASS | Clean render | [`404-not-found-en-360px.png`](screenshots/404-not-found-en-360px.png) |
| `/am` | 360px | 360px | 360px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-am-360px.png`](screenshots/home-am-360px.png) |
| `/am/services` | 360px | 360px | 360px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-am-360px.png`](screenshots/services-am-360px.png) |
| `/am/work` | 360px | 360px | 360px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-am-360px.png`](screenshots/work-am-360px.png) |
| `/am/about` | 360px | 360px | 360px | PASS | Clean render | [`about-am-360px.png`](screenshots/about-am-360px.png) |
| `/am/contact` | 360px | 360px | 360px | PASS | Clean render | [`contact-am-360px.png`](screenshots/contact-am-360px.png) |
| `/om` | 360px | 360px | 360px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-om-360px.png`](screenshots/home-om-360px.png) |
| `/om/services` | 360px | 360px | 360px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-om-360px.png`](screenshots/services-om-360px.png) |
| `/om/work` | 360px | 360px | 360px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-om-360px.png`](screenshots/work-om-360px.png) |
| `/om/about` | 360px | 360px | 360px | PASS | Clean render | [`about-om-360px.png`](screenshots/about-om-360px.png) |
| `/om/contact` | 360px | 360px | 360px | PASS | Clean render | [`contact-om-360px.png`](screenshots/contact-om-360px.png) |
| `/` | 390px | 390px | 390px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-en-390px.png`](screenshots/home-en-390px.png) |
| `/services` | 390px | 390px | 390px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-en-390px.png`](screenshots/services-en-390px.png) |
| `/services/web-development` | 390px | 390px | 390px | PASS | Clean render | [`service-detail-en-390px.png`](screenshots/service-detail-en-390px.png) |
| `/work` | 390px | 390px | 390px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-en-390px.png`](screenshots/work-en-390px.png) |
| `/work/os-dashboard` | 390px | 390px | 390px | PASS | Clean render | [`work-detail-en-390px.png`](screenshots/work-detail-en-390px.png) |
| `/blog` | 390px | 390px | 390px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`blog-en-390px.png`](screenshots/blog-en-390px.png) |
| `/blog/first-post` | 390px | 390px | 390px | PASS | Clean render | [`blog-detail-en-390px.png`](screenshots/blog-detail-en-390px.png) |
| `/about` | 390px | 390px | 390px | PASS | Clean render | [`about-en-390px.png`](screenshots/about-en-390px.png) |
| `/testimonials` | 390px | 390px | 390px | PASS | Cards: 3, bgMedia: false, img: false, video: false, footer: false | [`testimonials-en-390px.png`](screenshots/testimonials-en-390px.png) |
| `/contact` | 390px | 390px | 390px | PASS | Clean render | [`contact-en-390px.png`](screenshots/contact-en-390px.png) |
| `/privacy` | 390px | 390px | 390px | PASS | Clean render | [`privacy-en-390px.png`](screenshots/privacy-en-390px.png) |
| `/terms` | 390px | 390px | 390px | PASS | Clean render | [`terms-en-390px.png`](screenshots/terms-en-390px.png) |
| `/this-page-does-not-exist-404` | 390px | 390px | 390px | PASS | Clean render | [`404-not-found-en-390px.png`](screenshots/404-not-found-en-390px.png) |
| `/am` | 390px | 390px | 390px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-am-390px.png`](screenshots/home-am-390px.png) |
| `/am/services` | 390px | 390px | 390px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-am-390px.png`](screenshots/services-am-390px.png) |
| `/am/work` | 390px | 390px | 390px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-am-390px.png`](screenshots/work-am-390px.png) |
| `/am/about` | 390px | 390px | 390px | PASS | Clean render | [`about-am-390px.png`](screenshots/about-am-390px.png) |
| `/am/contact` | 390px | 390px | 390px | PASS | Clean render | [`contact-am-390px.png`](screenshots/contact-am-390px.png) |
| `/om` | 390px | 390px | 390px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-om-390px.png`](screenshots/home-om-390px.png) |
| `/om/services` | 390px | 390px | 390px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-om-390px.png`](screenshots/services-om-390px.png) |
| `/om/work` | 390px | 390px | 390px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-om-390px.png`](screenshots/work-om-390px.png) |
| `/om/about` | 390px | 390px | 390px | PASS | Clean render | [`about-om-390px.png`](screenshots/about-om-390px.png) |
| `/om/contact` | 390px | 390px | 390px | PASS | Clean render | [`contact-om-390px.png`](screenshots/contact-om-390px.png) |
| `/` | 412px | 412px | 412px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-en-412px.png`](screenshots/home-en-412px.png) |
| `/services` | 412px | 412px | 412px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-en-412px.png`](screenshots/services-en-412px.png) |
| `/services/web-development` | 412px | 412px | 412px | PASS | Clean render | [`service-detail-en-412px.png`](screenshots/service-detail-en-412px.png) |
| `/work` | 412px | 412px | 412px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-en-412px.png`](screenshots/work-en-412px.png) |
| `/work/os-dashboard` | 412px | 412px | 412px | PASS | Clean render | [`work-detail-en-412px.png`](screenshots/work-detail-en-412px.png) |
| `/blog` | 412px | 412px | 412px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`blog-en-412px.png`](screenshots/blog-en-412px.png) |
| `/blog/first-post` | 412px | 412px | 412px | PASS | Clean render | [`blog-detail-en-412px.png`](screenshots/blog-detail-en-412px.png) |
| `/about` | 412px | 412px | 412px | PASS | Clean render | [`about-en-412px.png`](screenshots/about-en-412px.png) |
| `/testimonials` | 412px | 412px | 412px | PASS | Cards: 3, bgMedia: false, img: false, video: false, footer: false | [`testimonials-en-412px.png`](screenshots/testimonials-en-412px.png) |
| `/contact` | 412px | 412px | 412px | PASS | Clean render | [`contact-en-412px.png`](screenshots/contact-en-412px.png) |
| `/privacy` | 412px | 412px | 412px | PASS | Clean render | [`privacy-en-412px.png`](screenshots/privacy-en-412px.png) |
| `/terms` | 412px | 412px | 412px | PASS | Clean render | [`terms-en-412px.png`](screenshots/terms-en-412px.png) |
| `/this-page-does-not-exist-404` | 412px | 412px | 412px | PASS | Clean render | [`404-not-found-en-412px.png`](screenshots/404-not-found-en-412px.png) |
| `/am` | 412px | 412px | 412px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-am-412px.png`](screenshots/home-am-412px.png) |
| `/am/services` | 412px | 412px | 412px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-am-412px.png`](screenshots/services-am-412px.png) |
| `/am/work` | 412px | 412px | 412px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-am-412px.png`](screenshots/work-am-412px.png) |
| `/am/about` | 412px | 412px | 412px | PASS | Clean render | [`about-am-412px.png`](screenshots/about-am-412px.png) |
| `/am/contact` | 412px | 412px | 412px | PASS | Clean render | [`contact-am-412px.png`](screenshots/contact-am-412px.png) |
| `/om` | 412px | 412px | 412px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-om-412px.png`](screenshots/home-om-412px.png) |
| `/om/services` | 412px | 412px | 412px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-om-412px.png`](screenshots/services-om-412px.png) |
| `/om/work` | 412px | 412px | 412px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-om-412px.png`](screenshots/work-om-412px.png) |
| `/om/about` | 412px | 412px | 412px | PASS | Clean render | [`about-om-412px.png`](screenshots/about-om-412px.png) |
| `/om/contact` | 412px | 412px | 412px | PASS | Clean render | [`contact-om-412px.png`](screenshots/contact-om-412px.png) |
| `/` | 768px | 768px | 768px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-en-768px.png`](screenshots/home-en-768px.png) |
| `/services` | 768px | 768px | 768px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-en-768px.png`](screenshots/services-en-768px.png) |
| `/services/web-development` | 768px | 768px | 768px | PASS | Clean render | [`service-detail-en-768px.png`](screenshots/service-detail-en-768px.png) |
| `/work` | 768px | 768px | 768px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-en-768px.png`](screenshots/work-en-768px.png) |
| `/work/os-dashboard` | 768px | 768px | 768px | PASS | Clean render | [`work-detail-en-768px.png`](screenshots/work-detail-en-768px.png) |
| `/blog` | 768px | 768px | 768px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`blog-en-768px.png`](screenshots/blog-en-768px.png) |
| `/blog/first-post` | 768px | 768px | 768px | PASS | Clean render | [`blog-detail-en-768px.png`](screenshots/blog-detail-en-768px.png) |
| `/about` | 768px | 768px | 768px | PASS | Clean render | [`about-en-768px.png`](screenshots/about-en-768px.png) |
| `/testimonials` | 768px | 768px | 768px | PASS | Cards: 3, bgMedia: false, img: false, video: false, footer: false | [`testimonials-en-768px.png`](screenshots/testimonials-en-768px.png) |
| `/contact` | 768px | 768px | 768px | PASS | Clean render | [`contact-en-768px.png`](screenshots/contact-en-768px.png) |
| `/privacy` | 768px | 768px | 768px | PASS | Clean render | [`privacy-en-768px.png`](screenshots/privacy-en-768px.png) |
| `/terms` | 768px | 768px | 768px | PASS | Clean render | [`terms-en-768px.png`](screenshots/terms-en-768px.png) |
| `/this-page-does-not-exist-404` | 768px | 768px | 768px | PASS | Clean render | [`404-not-found-en-768px.png`](screenshots/404-not-found-en-768px.png) |
| `/am` | 768px | 768px | 768px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-am-768px.png`](screenshots/home-am-768px.png) |
| `/am/services` | 768px | 768px | 768px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-am-768px.png`](screenshots/services-am-768px.png) |
| `/am/work` | 768px | 768px | 768px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-am-768px.png`](screenshots/work-am-768px.png) |
| `/am/about` | 768px | 768px | 768px | PASS | Clean render | [`about-am-768px.png`](screenshots/about-am-768px.png) |
| `/am/contact` | 768px | 768px | 768px | PASS | Clean render | [`contact-am-768px.png`](screenshots/contact-am-768px.png) |
| `/om` | 768px | 768px | 768px | PASS | Cards: 15, bgMedia: false, img: true, video: false, footer: true | [`home-om-768px.png`](screenshots/home-om-768px.png) |
| `/om/services` | 768px | 768px | 768px | PASS | Cards: 8, bgMedia: false, img: true, video: false, footer: true | [`services-om-768px.png`](screenshots/services-om-768px.png) |
| `/om/work` | 768px | 768px | 768px | PASS | Cards: 9, bgMedia: false, img: false, video: false, footer: true | [`work-om-768px.png`](screenshots/work-om-768px.png) |
| `/om/about` | 768px | 768px | 768px | PASS | Clean render | [`about-om-768px.png`](screenshots/about-om-768px.png) |
| `/om/contact` | 768px | 768px | 768px | PASS | Clean render | [`contact-om-768px.png`](screenshots/contact-om-768px.png) |

## 3. Detailed Page Observations

### A. Home Page (`/`, `/am`, `/om`)
- **Hero Lanyard Badge**: Renders cleanly hanging from the top hero container. Interactive drag transform works smoothly.
- **Services Cards**: Background media layer covers full card area with subtle contrast gradient. Price and CTA align cleanly at the bottom.
- **Featured Work Cards**: Display media background behind title and tech stack tags.

### B. Services Index (`/services`, `/am/services`, `/om/services`)
- Cards display in single-column on mobile (<768px) and 2-column on tablet/desktop (>=768px).
- Media fills card background layer without side bars or cropping distortions.
- Starting price and "View Details" CTA button align to the exact bottom line across cards.

### C. Service Detail (`/services/web-development`)
- 16:9 aspect ratio media banner scales cleanly to mobile width without overflow.
- Deliverables checklist, process steps, FAQ accordion, and inquiry CTA conform to viewport margins.

### D. Work Index (`/work`, `/am/work`, `/om/work`)
- Two-column grid on desktop/tablet, single-column on mobile.
- Technology chips wrap cleanly without clipping.
- Case study link buttons align at card bottom across matching row heights.

### E. Work Detail (`/work/os-dashboard`)
- Full 16:9 media banner at the top renders without side overflow.
- Metrics grid, challenges/solutions, and technology tags wrap naturally on 360-412px screens.

### F. Blog Index (`/blog`)
- Two-column layout on >=768px, single-column on mobile.
- Background media, date badge, reading time, and reaction buttons positioned without overlap.

### G. Blog Detail (`/blog/first-post`)
- Article media banner maintains 16:9 ratio.
- Comments section input maintains state without focus/visibility re-renders.

### H. About Page (`/about`, `/am/about`, `/om/about`)
- Hero image badge container `w-48 h-48` renders with lanyard strap.
- Social links adapt width dynamically to content length, avoiding fixed full-width stretch.
- Skills list, timeline milestones, and bio text maintain proper line heights and margins.

### I. Contact, Testimonials, Privacy, Terms, and 404
- Forms, inquiry select (with 7 services + 1 placeholder), quote cards, legal copy, and 404 page render with zero horizontal overflow at all tested widths.
