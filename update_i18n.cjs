const fs = require('fs');

const filesToUpdate = {
  './app/[locale]/not-found.tsx': [
    { target: '404 - Page Not Found', replace: "{t('title')}" },
    { target: "Sorry, we couldn't find the page you were looking for. It might have been moved or deleted.", replace: "{t('description')}" },
    { target: 'Return Home', replace: "{t('returnHome')}" },
    { target: 'export default function NotFound() {', replace: "import { useTranslations } from 'next-intl';\n\nexport default function NotFound() {\n  const t = useTranslations('NotFound');" }
  ],
  './app/[locale]/(public)/page.tsx': [
    { target: '>Get in Touch<', replace: ">{t('getInTouch')}<" },
    { target: '>Read Case Study<', replace: ">{t('readCaseStudy')}<" },
    { target: '>Learn More<', replace: ">{t('learnMore')}<" },
    { target: '>Read Article<', replace: ">{t('readArticle')}<" },
    { target: "'Anonymous'", replace: "t('anonymous')" },
    { target: 'at ${testimonial.organization}', replace: "${t('at')} ${testimonial.organization}" }
  ],
  './app/[locale]/(public)/about/page.tsx': [
    { target: '>About Me<', replace: ">{t('title')}<" },
    { target: '>Download Resume<', replace: ">{t('downloadResume')}<" },
    { target: '>Experience<', replace: ">{t('experience')}<" },
    { target: "'Present'", replace: "t('present')" },
    { target: '>Skills & Expertise<', replace: ">{t('skills')}<" },
    { target: 'export default async function AboutPage() {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function AboutPage() {\n  const t = await getTranslations('About');" }
  ],
  './app/[locale]/(public)/services/page.tsx': [
    { target: '>Services<', replace: ">{t('title')}<" },
    { target: '>\n          Comprehensive full-stack development and consulting services.\n        <', replace: ">\n          {t('subtitle')}\n        <" },
    { target: 'Starting at {service.startingPriceRange}', replace: "{t('startingAt')} {service.startingPriceRange}" },
    { target: '>View Details<', replace: ">{t('viewDetails')}<" },
    { target: 'export default async function ServicesPage() {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function ServicesPage() {\n  const t = await getTranslations('Services');" }
  ],
  './app/[locale]/(public)/services/[slug]/page.tsx': [
    { target: 'Starting at {service.startingPriceRange}', replace: "{t('startingAt')} {service.startingPriceRange}" },
    { target: '>What you get<', replace: ">{t('whatYouGet')}<" },
    { target: '>Delivery Approach<', replace: ">{t('deliveryApproach')}<" },
    { target: "'1. Discovery'", replace: "t('phase1Step')" },
    { target: "'Understanding requirements and goals.'", replace: "t('phase1Desc')" },
    { target: "'2. Design'", replace: "t('phase2Step')" },
    { target: "'Architecture and user experience planning.'", replace: "t('phase2Desc')" },
    { target: "'3. Development'", replace: "t('phase3Step')" },
    { target: "'Iterative coding and feature implementation.'", replace: "t('phase3Desc')" },
    { target: "'4. Testing'", replace: "t('phase4Step')" },
    { target: "'Rigorous QA and automated testing.'", replace: "t('phase4Desc')" },
    { target: "'5. Deployment'", replace: "t('phase5Step')" },
    { target: "'Smooth transition to production.'", replace: "t('phase5Desc')" },
    { target: "'6. Support'", replace: "t('phase6Step')" },
    { target: "'Ongoing maintenance and optimization.'", replace: "t('phase6Desc')" },
    { target: '>Ready to get started?<', replace: ">{t('readyToGetStarted')}<" },
    { target: ">\n          Let&apos;s discuss how this service can help you achieve your goals. \n          Contact me today for a free consultation.\n        <", replace: ">\n          {t('readyDescription')}\n        <" },
    { target: '>Start a Conversation<', replace: ">{t('startConversation')}<" },
    { target: 'export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {\n  const t = await getTranslations('Services');" }
  ],
  './app/[locale]/(public)/work/page.tsx': [
    { target: '>Selected Work<', replace: ">{t('title')}<" },
    { target: ">\n          Dive into detailed case studies explaining how we solved complex problems, \n          the architecture we used, and the outcomes we achieved.\n        <", replace: ">\n          {t('subtitle')}\n        <" },
    { target: '>Filter by Tech:<', replace: ">{t('filterByTech')}<" },
    { target: '>All<', replace: ">{t('all')}<" },
    { target: '>Read Case Study<', replace: ">{t('readCaseStudy')}<" },
    { target: '>\n            No case studies found matching the selected filters.\n          <', replace: ">\n            {t('noCaseStudies')}\n          <" },
    { target: 'export default async function WorkPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function WorkPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {\n  const t = await getTranslations('Work');" }
  ],
  './app/[locale]/(public)/work/[slug]/page.tsx': [
    { target: '>Role:<', replace: ">{t('role')}<" },
    { target: '>Published:<', replace: ">{t('published')}<" },
    { target: '>The Problem<', replace: ">{t('theProblem')}<" },
    { target: '>The Solution<', replace: ">{t('theSolution')}<" },
    { target: '>Architecture<', replace: ">{t('architecture')}<" },
    { target: '>Key Decisions<', replace: ">{t('keyDecisions')}<" },
    { target: '>Challenges<', replace: ">{t('challenges')}<" },
    { target: '>Outcome<', replace: ">{t('outcome')}<" },
    { target: '>Deep Dive<', replace: ">{t('deepDive')}<" },
    { target: '>Have a similar problem to solve?<', replace: ">{t('haveSimilarProblem')}<" },
    { target: '>Get in Touch<', replace: ">{t('getInTouch')}<" },
    { target: 'export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {\n  const t = await getTranslations('Work');" }
  ],
  './app/[locale]/(public)/blog/page.tsx': [
    { target: '>Blog<', replace: ">{t('title')}<" },
    { target: 'placeholder="Search posts..."', replace: "placeholder={t('searchPlaceholder')}" },
    { target: '>Search<', replace: ">{t('searchButton')}<" },
    { target: '>No posts found.<', replace: ">{t('noPosts')}<" },
    { target: 'export default async function BlogIndexPage({ searchParams }: { searchParams: { q?: string, category?: string, tag?: string } }) {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function BlogIndexPage({ searchParams }: { searchParams: { q?: string, category?: string, tag?: string } }) {\n  const t = await getTranslations('Blog');" }
  ],
  './app/[locale]/(public)/contact/page.tsx': [
    { target: '>Get in Touch<', replace: ">{t('title')}<" },
    { target: '>\n          Have a project in mind? Fill out the form below or reach out directly.\n        <', replace: ">\n          {t('subtitle')}\n        <" },
    { target: '>Send a Message<', replace: ">{t('sendAMessage')}<" },
    { target: '>Direct Contact<', replace: ">{t('directContact')}<" },
    { target: '>Email<', replace: ">{t('email')}<" },
    { target: '>Connect<', replace: ">{t('connect')}<" },
    { target: 'export default async function ContactPage() {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function ContactPage() {\n  const t = await getTranslations('Contact');" }
  ],
  './app/[locale]/(public)/contact/ContactForm.tsx': [
    { target: '>Thank you!<', replace: ">{t('successTitle')}<" },
    { target: '>Your inquiry has been received. We will get back to you shortly.<', replace: ">{t('successMessage')}<" },
    { target: '>Please fix the following errors:<', replace: ">{t('errorTitle')}<" },
    { target: '>Leave this empty<', replace: ">{t('leaveEmpty')}<" },
    { target: '>Name *<', replace: ">{t('name')}<" },
    { target: '>Email *<', replace: ">{t('emailLabel')}<" },
    { target: '>Organization (Optional)<', replace: ">{t('organization')}<" },
    { target: '>Project Type<', replace: ">{t('projectType')}<" },
    { target: '>Select a project type...<', replace: ">{t('selectProjectType')}<" },
    { target: '>Business website<', replace: ">{t('typeBusiness')}<" },
    { target: '>Internal system<', replace: ">{t('typeInternal')}<" },
    { target: '>Dashboard<', replace: ">{t('typeDashboard')}<" },
    { target: '>Automation<', replace: ">{t('typeAutomation')}<" },
    { target: '>API/Integration<', replace: ">{t('typeAPI')}<" },
    { target: '>Other<', replace: ">{t('typeOther')}<" },
    { target: '>Message *<', replace: ">{t('message')}<" },
    { target: '>Please describe your project or inquiry (10-5000 characters).<', replace: ">{t('messageHint')}<" },
    { target: 'By submitting this form, you acknowledge our', replace: "{t('privacyPrefix')}" },
    { target: '>Privacy Policy<', replace: ">{t('privacyLink')}<" },
    { target: "'Sending...'", replace: "t('sending')" },
    { target: "'Send Message'", replace: "t('sendMessage')" },
    { target: "'Submission failed'", replace: "t('submissionFailed')" },
    { target: "'An unexpected error occurred. Please try again later.'", replace: "t('unexpectedError')" },
    { target: 'export function ContactForm() {', replace: "import { useTranslations } from 'next-intl';\n\nexport function ContactForm() {\n  const t = useTranslations('Contact');" }
  ],
  './app/[locale]/(public)/privacy/page.tsx': [
    { target: '>Privacy Policy<', replace: ">{t('title')}<" },
    { target: '>Last updated: September 28, 2026<', replace: ">{t('updated')}<" },
    { target: '>1. Information We Collect<', replace: ">{t('h1')}<" },
    { target: '>\n          When you submit an inquiry through our contact form, we collect only the information you voluntarily provide:\n        <', replace: ">\n          {t('p1_1')}\n        <" },
    { target: '>Name<', replace: ">{t('li1')}<" },
    { target: '>Email address<', replace: ">{t('li2')}<" },
    { target: '>Organization (optional)<', replace: ">{t('li3')}<" },
    { target: '>Project type (optional)<', replace: ">{t('li4')}<" },
    { target: '>Message content<', replace: ">{t('li5')}<" },
    { target: '\n          We also record the internal source page from which you submitted the form. <strong>We do not store your raw IP address or user-agent string</strong> in our inquiry records.\n        ', replace: "\n          {t('p1_2')} <strong>{t('p1_strong')}</strong>{t('p1_3')}\n        " },
    { target: '>2. How We Use Your Information<', replace: ">{t('h2')}<" },
    { target: '>\n          We use the collected information solely to:\n        <', replace: ">\n          {t('p2_1')}\n        <" },
    { target: '>Respond to your project inquiry<', replace: ">{t('li6')}<" },
    { target: '>Provide technical consulting services<', replace: ">{t('li7')}<" },
    { target: '>Send an automated acknowledgement email (if enabled)<', replace: ">{t('li8')}<" },
    { target: '>3. Data Retention<', replace: ">{t('h3')}<" },
    { target: '\n          We retain your inquiry data for a maximum of <strong>{retentionDays} days</strong>. After this period, your inquiry records are permanently deleted from our database.\n        ', replace: "\n          {t('p3_1')} <strong>{t('p3_strong', { days: retentionDays })}</strong>{t('p3_2')}\n        " },
    { target: '>4. Data Sharing and Security<', replace: ">{t('h4')}<" },
    { target: '>\n          We do not sell, rent, or trade your personal information to third parties. We use secure email transport to deliver your inquiry to our team.\n        <', replace: ">\n          {t('p4_1')}\n        <" },
    { target: '>5. Contact Us<', replace: ">{t('h5')}<" },
    { target: '\n          If you have questions about this privacy policy, please <Link href="/contact">contact us</Link>.\n        ', replace: '\n          {t(\'p5_1\')} <Link href="/contact">{t(\'p5_link\')}</Link>{t(\'p5_2\')}\n        ' },
    { target: 'export default async function PrivacyPage() {', replace: "import { getTranslations } from 'next-intl/server';\n\nexport default async function PrivacyPage() {\n  const t = await getTranslations('Privacy');" }
  ],
  './app/[locale]/(public)/terms/page.tsx': [
    { target: '>Terms of Service<', replace: ">{t('title')}<" },
    { target: '>Last updated: September 28, 2026<', replace: ">{t('updated')}<" },
    { target: '>1. Acceptance of Terms<', replace: ">{t('h1')}<" },
    { target: '>\n          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.\n        <', replace: ">\n          {t('p1')}\n        <" },
    { target: '>2. Use of Site<', replace: ">{t('h2')}<" },
    { target: '>\n          You may use our site for lawful purposes only. You must not use our site in any way that breaches any applicable local, national, or international law or regulation.\n        <', replace: ">\n          {t('p2')}\n        <" },
    { target: '>3. Intellectual Property<', replace: ">{t('h3')}<" },
    { target: '>\n          The content on this website, including but not limited to case studies, portfolio projects, blog posts, text, and graphics, is the property of Gurmesa and is protected by copyright laws. You may not reproduce or distribute it without explicit permission.\n        <', replace: ">\n          {t('p3')}\n        <" },
    { target: '>4. Limitation of Liability<', replace: ">{t('h4')}<" },
    { target: '>\n          We will not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our services or website.\n        <', replace: ">\n          {t('p4')}\n        <" },
    { target: '>5. Changes to Terms<', replace: ">{t('h5')}<" },
    { target: '>\n          We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated terms on the site. Your decision to continue to visit and make use of the site after such changes have been made constitutes your formal acceptance of the new Terms of Service.\n        <', replace: ">\n          {t('p5')}\n        <" },
    { target: '>6. Contact Us<', replace: ">{t('h6')}<" },
    { target: '\n          If you have any questions about these Terms, please <Link href="/contact">contact us</Link>.\n        ', replace: '\n          {t(\'p6_1\')} <Link href="/contact">{t(\'p6_link\')}</Link>{t(\'p6_2\')}\n        ' },
    { target: 'export default function TermsPage() {', replace: "import { useTranslations } from 'next-intl';\n\nexport default function TermsPage() {\n  const t = useTranslations('Terms');" }
  ]
};

for (const [filePath, replacements] of Object.entries(filesToUpdate)) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { target, replace } of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replace);
    } else {
      console.log('Could not find target in', filePath, ':', target);
    }
  }
  fs.writeFileSync(filePath, content);
}

console.log('Components updated.');
