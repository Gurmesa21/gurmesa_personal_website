# Part 1: Full I18n Sweep

## Findings & Changes
- Conducted a comprehensive sweep of the public UI pages (`/`, `/work`, `/services`, `/about`, `/blog`, `/contact`).
- Verified that all static UI text (navigation links, buttons like "Read Case Study", "Get in Touch", section headers, footer links) is properly routed through `next-intl` dictionary lookups.
- Verified that `am.json` and `om.json` contain accurate and complete translations for all these keys.
- Confirmed that dynamic, owner-authored content (such as blog post bodies, case studies, and testimonial contents) remains strictly in English, as per the design requirements.
- Captured a full-page screenshot of the homepage (`/`) localized in Oromo (`/om`), saved as `docs/evidence/day14-5/partD/part1-i18n.png`, proving the UI translation scaffolding is active and fully functional.
