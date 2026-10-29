# C1.1 Page Title and Description Block Inventory (Public Pages)

| Template | File | Big Heading (file:line) | Description Paragraph (file:line) | What Other Visible Heading Remains |
| :--- | :--- | :--- | :--- | :--- |
| `about` | `app/[locale]/(public)/about/page.tsx` | `L132-134`: `<h1>{profile?.name \|\| t('title')}</h1>` | `L135-137`: `<p>{profile?.title}</p>` (and `L142-144`: `<p>{profile.bio}</p>`) | `L184`: `<h3>Interested in collaborating on a project?</h3>`<br>`L212`: `<h2>{t('experience')}</h2>`<br>`L227`: `<h3>{exp.role}</h3>`<br>`L253`: `<h2>{t('skills')}</h2>`<br>`L262`: `<h3>{category}</h3>` |
| `services` | `app/[locale]/(public)/services/page.tsx` | `L84-86`: `<h1>{t('title')}</h1>` | `L87-89`: `<p>{t('subtitle')}</p>` | `L148-150`: `<h2>{service.title}</h2>` (on each service card) |
| `services/[slug]` | `app/[locale]/(public)/services/[slug]/page.tsx` | `L107-109`: `<h1>{service.title}</h1>` | `L111-113`: `<p>{service.summary}</p>` | `L144`: `<h2>Overview</h2>`<br>`L158`: `<h2>{t('whatYouGet')}</h2>`<br>`L181`: `<h2>{t('howWeWork')}</h2>`<br>`L249`: `<h3>{t('scheduleConsultation')}</h3>` (sidebar) |
| `work` | `app/[locale]/(public)/work/page.tsx` | `L155-157`: `<h1>{t('title')}</h1>` | `L158-160`: `<p>{t('subtitle')}</p>` | `L259-261`: `<h2>{project.title}</h2>` (on each project card) |
| `work/[slug]` | `app/[locale]/(public)/work/[slug]/page.tsx` | `L134-136`: `<h1>{project.title}</h1>` | `L138-140`: `<p>{project.summary}</p>` | `L171`: `<h2>{t('problem')}</h2>`<br>`L185`: `<h2>{t('solution')}</h2>`<br>`L199`: `<h2>{t('architecture')}</h2>`<br>`L224`: `<h2>{t('decisions')}</h2>`<br>`L247`: `<h2>{t('outcomes')}</h2>`<br>`L274`: `<h2>{t('technologies')}</h2>`<br>`L315`: `<h3>{t('projectDetails')}</h3>` (sidebar) |
| `blog` | `app/[locale]/(public)/blog/page.tsx` | `L73-75`: `<h1>{t('title')}</h1>` | *None* (no subtitle/description paragraph in template) | `L143`: `<h2>{post.title}</h2>` (on each post card) |
| `blog/[slug]` | `components/blog/BlogPostClientView.tsx` (rendered by `app/[locale]/(public)/blog/[slug]/page.tsx`) | `L460-462`: `<h1>{post.title}</h1>` | `L464-468`: `<p>{post.excerpt}</p>` | Markdown headings (`h2`, `h3`, etc. in post body)<br>`L605`: `<h2>{tHome('aboutMe')}</h2>` (sidebar)<br>`L623`: `<h3>{profile?.name}</h3>` (sidebar) |
| `contact` | `app/[locale]/(public)/contact/page.tsx` | `L61-63`: `<h1>{t('title')}</h1>` | `L65-67`: `<p>{t('subtitle')}</p>` | `L81`: `<h2>{t('directContact')}</h2>`<br>`L153`: `<h2>{t('sendAMessage')}</h2>` |
| `testimonials` | `app/[locale]/(public)/testimonials/page.tsx` | `L37-39`: `<h1>{t('title')}</h1>` | `L41-43`: `<p>{t('subtitle')}</p>` | `L69`: `<h2>Client & Collaborator Feedback</h2>`<br>`L101`: `<h2>{t('submitTitle')}</h2>` |
| `privacy` | `app/[locale]/(public)/privacy/page.tsx` | `L31-33`: `<h1>{t('title')}</h1>` | `L34-36`: `<p>{t('updated')}</p>` | `L43`: `<h2>{t('h1')}</h2>`<br>`L58`: `<h2>{t('h2')}</h2>`<br>`L66`: `<h2>{t('h3')}</h2>`<br>`L71`: `<h2>{t('h4')}</h2>`<br>`L74`: `<h2>{t('h5')}</h2>` |
| `terms` | `app/[locale]/(public)/terms/page.tsx` | `L20-22`: `<h1>{t('title')}</h1>` | `L23-25`: `<p>{t('updated')}</p>` | `L32`: `<h2>{t('h1')}</h2>`<br>`L35`: `<h2>{t('h2')}</h2>`<br>`L38`: `<h2>{t('h3')}</h2>`<br>`L41`: `<h2>{t('h4')}</h2>`<br>`L44`: `<h2>{t('h5')}</h2>`<br>`L47`: `<h2>{t('h6')}</h2>` |
| `404` | `app/[locale]/not-found.tsx` | `L9`: `<h1>{t('title')}</h1>` | `L10-12`: `<p>{t('description')}</p>` | **None** (page will have no visible headings once `<h1>` is hidden) |

---

### Out of Scope (For Information Only)
- **Home Page (`app/[locale]/(public)/page.tsx`)**:
  - Hero H1 (`L327-329`): `<h1>{profile?.name || 'Gurmesa Teklemariam'}</h1>`
  - Hero Tagline (`L331-333`): `<p>{profile.tagline}</p>`
  - Hero Bio (`L339-341`): `<p>{profile.bio}</p>`
  - Section Headings:
    - `L390`: `<h2>{t('servicesTitle')}</h2>`
    - `L504`: `<h2>{t('workTitle')}</h2>`
    - `L653`: `<h2>{t('blogTitle')}</h2>`
    - `L747`: `<h2>{t('testimonialsTitle')}</h2>`
    - `L809`: `<h2>{t('aboutTitle')}</h2>`

