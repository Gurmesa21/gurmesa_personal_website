# C1.3 Screenshot Analysis: Before and After Design Changes

## Overview
Captured 32 before screenshots and 32 after screenshots at 1280px (Desktop) and 375px (Mobile) across all 12 templates in English, plus Amharic (`am`) and Afaan Oromoo (`om`) for Services and Blog.

- **Before Screenshots Location**: `docs/evidence/phase3/screenshots-before/` (32 PNG files)
- **After Screenshots Location**: `docs/evidence/phase3/screenshots-after/` (32 PNG files)

## Detailed Observations by Page

### 1. `about` (`/en/about`)
- **Before**: Displayed prominent `<h1>Gurmesa Teklemariam</h1>` and `<p className="... font-semibold text-[#A995FF]">Full-Stack Engineer & Architect</p>`, followed by biography, action buttons, collaboration card, and two-column Experience/Skills sections.
- **After**: The prominent `<h1>` is now visually hidden (`className="sr-only"`), preserving accessibility and SEO while removing visual duplication with the navigation and profile card. The description `<p>` (`profile.title`) has been removed. The hero card now cleanly starts with the role badge and live availability status indicator, flowing straight into the biographical narrative and social links. Content starts at the exact same distance under the navbar without any awkward blank space.
- **Visible Headings Remaining**: `<h2>Experience</h2>`, `<h3>[Role Titles]</h3>`, `<h2>Skills</h2>`, `<h3>[Skill Categories]</h3>`, `<h3>Interested in collaborating on a project?</h3>`.

### 2. `services` (`/en/services`, `/am/services`, `/om/services`)
- **Before**: Page featured an introductory header block containing a "Services" badge, big `<h1>Services</h1>`, and a subtitle paragraph above the 2-column service cards grid.
- **After**: The top title and subtitle block is completely removed, with `<h1>` retained via `className="sr-only"`. The service cards grid begins immediately under the standard top padding (`py-8 sm:py-10 md:py-12`).
- **Visible Headings Remaining**: Each individual card prominently displays `<h2>{service.title}</h2>` ("Web Development", "Technical Consulting", etc.).

### 3. `services/[slug]` (`/en/services/web-development`)
- **Before**: Contained breadcrumb navigation, service badge pill, starting price badge, huge `<h1>{service.title}</h1>`, summary paragraph, wide media banner, and detailed content sections.
- **After**: The big `<h1>` is visually hidden (`sr-only`) and the summary `<p>` is removed. Breadcrumb and meta badges (Service tag and Starting Price) cleanly sit above the featured media banner.
- **Visible Headings Remaining**: `<h2>Overview</h2>`, `<h2>What You Get</h2>`, `<h2>Process</h2>`, `<h3>Schedule a Technical Consultation</h3>`.

### 4. `work` (`/en/work`)
- **Before**: Displayed page header with "Portfolio" badge, `<h1>Work</h1>`, and subtitle `<p>`, followed by the interactive technology filter bar and project card grid.
- **After**: The page header block is removed, keeping `<h1>` as `sr-only`. The technology filter bar ("Filter by tech:", "All", "Next.js", etc.) now sits directly at the top of the content area, creating immediate interactivity.
- **Visible Headings Remaining**: Each project card features `<h2>{project.title}</h2>`.

### 5. `work/[slug]` (`/en/work/fog`)
- **Before**: Displayed breadcrumb, badges (Case Study, Role, Date), large `<h1>{project.title}</h1>`, summary paragraph, hero media banner, and case study body sections.
- **After**: The `<h1>` is `sr-only` and the summary paragraph is deleted. Breadcrumbs and metadata badges sit right above the media banner.
- **Visible Headings Remaining**: `<h2>Problem</h2>`, `<h2>Solution</h2>`, `<h2>Architecture & Engineering</h2>`, `<h2>Key Decisions</h2>`, `<h2>Outcomes & Metrics</h2>`, `<h2>Technologies Used</h2>`, `<h3>Project Metadata</h3>`.

### 6. `blog` (`/en/blog`, `/am/blog`, `/om/blog`)
- **Before**: Contained a split header with "Articles" pill and `<h1>Articles</h1>` on the left, and a search input form on the right.
- **After**: The left title block is removed, with `<h1>` kept as `sr-only`. The search bar is preserved and neatly aligned on the right, providing direct access to searching articles without extra vertical baggage.
- **Visible Headings Remaining**: Each article card features `<h2>{post.title}</h2>`.

### 7. `blog/[slug]` (`/en/blog/second-post`)
- **Before**: Contained breadcrumbs, category and reading-time badges, large `<h1>{post.title}</h1>`, excerpt paragraph, wide media banner, article body, and sidebar.
- **After**: The `<h1>` is `sr-only` and the excerpt paragraph is deleted. The metadata badges sit cleanly atop the media banner.
- **Visible Headings Remaining**: Markdown body headings (`<h2>`, `<h3>` within content) and sidebar `<h2>About Me</h2>`.

### 8. `contact` (`/en/contact`)
- **Before**: Page header with "Get in Touch" pill, availability status, `<h1>Contact</h1>`, and subtitle paragraph, followed by a two-column contact form layout.
- **After**: The top title block is removed with `<h1>` preserved as `sr-only`. The two-column layout starts directly at the top with balanced spacing.
- **Visible Headings Remaining**: `<h2>Direct Contact</h2>`, `<h2>Send a Message</h2>`.

### 9. `testimonials` (`/en/testimonials`)
- **Before**: Header with "Testimonials" pill, `<h1>Testimonials</h1>`, subtitle paragraph, endorsement counter pill, and mobile anchor button.
- **After**: The title and subtitle block is removed with `<h1>` kept as `sr-only`. The quick action bar with endorsement count and mobile feedback link is preserved right above the two-column layout.
- **Visible Headings Remaining**: `<h2>Client & Collaborator Feedback</h2>`, `<h2>Submit a Testimonial</h2>`.

### 10. `privacy` (`/en/privacy`)
- **Before**: Header with "Legal & Compliance" pill, `<h1>Privacy Policy</h1>`, and "Last updated" paragraph, followed by the policy card.
- **After**: The header block is removed, with `<h1>` preserved as `sr-only`. The policy card begins right under top padding.
- **Visible Headings Remaining**: All numbered section headings: `<h2>1. Information We Collect</h2>`, `<h2>2. How We Use Your Information</h2>`, `<h2>3. Data Retention & Privacy Rights</h2>`, `<h2>4. Third-Party Services</h2>`, `<h2>5. Contact Information</h2>`.

### 11. `terms` (`/en/terms`)
- **Before**: Header with "Legal Agreement" pill, `<h1>Terms of Service</h1>`, and "Last updated" paragraph, followed by the terms card.
- **After**: The header block is removed, with `<h1>` preserved as `sr-only`. The terms card begins right under top padding.
- **Visible Headings Remaining**: All numbered section headings: `<h2>1. Acceptance of Terms</h2>`, `<h2>2. Intellectual Property Rights</h2>`, `<h2>3. Content & Comments</h2>`, `<h2>4. Limitation of Liability</h2>`, `<h2>5. Changes to Terms</h2>`, `<h2>6. Governing Law & Contact</h2>`.

### 12. `404` (`/en/page-not-found-404`)
- **Before**: Centered `<h1>Page Not Found</h1>`, description `<p>The page you are looking for does not exist.</p>`, and "Return Home" button.
- **After**: Centered hidden `<h1 className="sr-only">Page Not Found</h1>` and "Return Home" button.

---

## Decision Point for Owner: Pages With NO Visible Title or Heading
The following page has **NO visible title or heading at all** (only the interactive button and hidden `sr-only` h1):
- **`404` (`app/[locale]/not-found.tsx`)**:
  - Contains only the "Return Home" button visually.
  - *Recommendation*: If the owner prefers visible text for 404 visitors, a visible display indicator such as a large "404" badge or title can be rendered, while keeping the accessibility `h1`.

