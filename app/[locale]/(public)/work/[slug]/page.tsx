import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicCaseStudyBySlug } from '@/server/services/projectService';
import { Button } from '@/components/ui/button';
import { serializeJsonLd } from '@/lib/jsonLd';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { getTranslations } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import {
  ImageIcon,
  ChevronRight,
  Calendar,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(rawSlug);
  const override = (await getSeoOverride(`/work/${rawSlug}`)) || (await getSeoOverride(`/work/${decodedSlug}`));
  const project = (await getPublicCaseStudyBySlug(rawSlug)) || (await getPublicCaseStudyBySlug(decodedSlug));
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || project?.title || 'Case Study',
    description: override?.description || project?.summary || 'Project details.',
    alternates: { canonical: override?.canonical || `${siteUrl}/work/${rawSlug}` },
    openGraph: {
      title: override?.title || project?.title || 'Case Study',
      description: override?.description || project?.summary,
      url: `${siteUrl}/work/${rawSlug}`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('Work');
  const tNav = await getTranslations('Navigation');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  const rawSlug = (await params).slug;
  const decodedSlug = decodeURIComponent(rawSlug);
  const project = (await getPublicCaseStudyBySlug(rawSlug)) || (await getPublicCaseStudyBySlug(decodedSlug));

  if (!project) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Work", "item": `${siteUrl}/work` },
      { "@type": "ListItem", "position": 3, "name": project.title, "item": `${siteUrl}/work/${(await params).slug}` }
    ]
  };

  const pms = await prisma.projectMedia.findMany({
    where: { projectId: project.id },
    orderBy: { order: 'asc' },
    include: { media: true }
  });

  const storage = getStorageAdapter();

  const mediaItems = await Promise.all(pms.map(async pm => {
    return {
      id: pm.id,
      order: pm.order,
      altText: pm.altText || project.title,
      mimeType: pm.media?.mimeType || 'image/jpeg',
      url: pm.media ? await storage.getUrl(pm.media.storageKey) : null
    };
  }));

  const featuredImage = mediaItems.find(m => m.order === 0 && m.url);
  const galleryImages = mediaItems.filter(m => m.order > 0 && m.url);

  // Table of contents anchors based on available data
  const tocItems = [
    { id: 'problem', label: t('theProblem') },
    { id: 'solution', label: t('theSolution') },
    { id: 'architecture', label: t('architecture') },
    ...(project.keyDecisions ? [{ id: 'decisions', label: t('keyDecisions') }] : []),
    ...(project.challenges ? [{ id: 'challenges', label: t('challenges') }] : []),
    { id: 'outcome', label: t('outcome') },
    ...(project.content ? [{ id: 'deep-dive', label: t('deepDive') }] : []),
    ...(galleryImages.length > 0 ? [{ id: 'gallery', label: t('gallery') || 'Gallery' }] : [])
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 lg:space-y-10">
        {/* Compact Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#A5ABC1]">
          <Link href="/" className="hover:text-[#F5F6FC] transition-colors">{tNav('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#292D45]" />
          <Link href="/work" className="hover:text-[#F5F6FC] transition-colors">{tNav('work')}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#292D45]" />
          <span className="text-[#F5F6FC] font-medium truncate max-w-[240px] sm:max-w-md">{project.title}</span>
        </nav>

        {/* Compact Project Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#A995FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />
              {t('caseStudy')}
            </span>
            {project.role && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#A995FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />
                {t('role')} {project.role}
              </span>
            )}
            {project.publishedAt && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#292D45] bg-[#101426] text-[#A5ABC1]">
                <Calendar className="w-3.5 h-3.5 text-[#8063F7]" />
                {new Date(project.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-2xl lg:text-3xl font-heading font-bold tracking-tight text-[#F5F6FC] leading-tight">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-[#A5ABC1] max-w-4xl leading-relaxed">
            {project.summary}
          </p>
        </header>

        {/* Wide Project Hero Banner */}

        <div className="relative w-full aspect-[21/9] min-h-[260px] max-h-[460px] border border-[#292D45] bg-[#101426] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/100 hover:shadow-x2 hover:shadow-[#8063F7]/20 rounded-2xl overflow-hidden border border-[#292D45] bg-[#101426] shadow-2xl flex items-center justify-center">
          {featuredImage ? (
            <MediaRenderer
              url={featuredImage.url!}
              mimeType={featuredImage.mimeType}
              altText={featuredImage.altText}
              fill
              className="object-cover"
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-[#171D32] via-[#101426] to-[#171D32]/80 flex flex-col items-center justify-center gap-3 ">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4F6FF0]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#8063F7]/15 blur-3xl" />
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4F6FF0]/30 bg-[#101426] text-[#4F6FF0] shadow-inner">
                <ImageIcon className="w-8 h-8 opacity-80 " />
              </div>
            </div>
          )}
        </div>

        {/* Two-Column Case Study Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Editorial Case-Study Content (~68% width on desktop) */}
          <main className="lg:col-span-8 space-y-6 min-w-0">
            {/* The Problem Section */}
            {project.problem && (
              <section
                id="problem"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('theProblem')}
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-[#A5ABC1] leading-relaxed">
                    {project.problem}
                  </p>
                </div>
              </section>
            )}

            {/* The Solution Section */}
            {project.solution && (
              <section
                id="solution"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('theSolution')}
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-[#A5ABC1] leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              </section>
            )}

            {/* Architecture Section */}
            {project.architectureSummary && (
              <section
                id="architecture"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('architecture')}
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-[#A5ABC1] leading-relaxed">
                    {project.architectureSummary}
                  </p>
                </div>
              </section>
            )}

            {/* Key Decisions Section */}
            {project.keyDecisions && (
              <section
                id="decisions"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('keyDecisions')}
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-[#A5ABC1] leading-relaxed">
                    {project.keyDecisions}
                  </p>
                </div>
              </section>
            )}

            {/* Challenges Section */}
            {project.challenges && (
              <section
                id="challenges"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('challenges')}
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-[#A5ABC1] leading-relaxed">
                    {project.challenges}
                  </p>
                </div>
              </section>
            )}

            {/* Outcome Highlight Box */}
            {project.outcome && (
              <section
                id="outcome"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('outcome')}
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-[#A5ABC1] leading-relaxed">
                    {project.outcome}
                  </p>
                </div>
              </section>
            )}

            {/* Deep Dive Section */}
            {project.content && (
              <section
                id="deep-dive"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('deepDive')}
                    </h2>
                  </div>
                  <div className="prose prose-invert max-w-none text-[#A5ABC1] leading-relaxed prose-headings:font-heading prose-headings:text-[#F5F6FC] prose-p:text-[#A5ABC1] prose-a:text-[#A995FF] hover:prose-a:text-white prose-pre:border prose-pre:border-[#292D45] prose-pre:bg-[#171D32]">
                    <MarkdownRenderer content={project.content} />
                  </div>
                </div>
              </section>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <section
                id="gallery"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 scroll-mt-24"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-[#8063F7]/15 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[#F5F6FC]">
                      {t('gallery') || 'Project Gallery'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {galleryImages.map(img => (
                      <div
                        key={img.id}
                        className="group/img relative w-full aspect-video rounded-xl overflow-hidden border border-[#292D45] bg-[#171D32] flex items-center justify-center transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10"
                      >
                        <MediaRenderer url={img.url!} mimeType={img.mimeType} altText={img.altText} fill className="object-cover transition-transform duration-500 group-hover/img:scale-105" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </main>

          {/* Sticky Right Sidebar (~32% width on desktop) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 space-y-6 shadow-xl shadow-black/40 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10">
              {/* Thin Top Accent Line Animation */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

              {/* Internal Violet Accent Aura */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-[#8063F7]/20 via-[#4F6FF0]/10 to-transparent blur-3xl" />

              <div className="relative z-10 space-y-5">
                {/* Header with Case Study badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
                      {t('projectOverview')}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-0.5 text-xs font-medium text-[#10B981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    {t('activeCaseStudy')}
                  </span>
                </div>

                {/* Metadata Specifications */}
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#292D45]/50">
                    <dt className="text-xs text-[#A5ABC1]">{t('type')}</dt>
                    <dd className="text-xs font-semibold text-[#F5F6FC]">{t('caseStudy')}</dd>
                  </div>
                  {project.role && (
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#292D45]/50">
                      <dt className="text-xs text-[#A5ABC1]">{t('role')}</dt>
                      <dd className="text-xs font-semibold text-[#F5F6FC]">{project.role}</dd>
                    </div>
                  )}
                  {project.scope && (
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#292D45]/50">
                      <dt className="text-xs text-[#A5ABC1]">{t('scope')}</dt>
                      <dd className="text-xs font-semibold text-[#F5F6FC]">{project.scope}</dd>
                    </div>
                  )}
                  {project.publishedAt && (
                    <div className="flex items-center justify-between">
                      <dt className="text-xs text-[#A5ABC1]">{t('published')}</dt>
                      <dd className="text-xs font-semibold text-[#F5F6FC]">
                        {new Date(project.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </dd>
                    </div>
                  )}
                </dl>

                {project.liveUrl && (
                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-xl border-[#8063F7]/40 bg-[#8063F7]/10 text-xs sm:text-sm font-semibold text-[#A995FF] hover:bg-[#8063F7]/20 hover:text-white hover:border-[#8063F7] transition-all shadow-sm"
                    >
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <span>{t('visitLiveProject')}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#A995FF]" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Technologies Stack */}
                {project.technologies.length > 0 && (
                  <div className="pt-3 border-t border-[#292D45]/60 space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
                      {t('technologies')}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map(tech => (
                        <span
                          key={tech.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border border-[#292D45] bg-[#171D32] text-[#F5F6FC] transition-colors hover:border-[#8063F7]/50 hover:text-white"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Table of Contents Navigation */}
                {tocItems.length > 1 && (
                  <div className="pt-3 border-t border-[#292D45]/60 space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
                      Table of Contents
                    </h4>
                    <nav aria-label="Table of contents" className="space-y-1">
                      {tocItems.map(item => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="flex items-center gap-2 py-1 text-xs text-[#A5ABC1] hover:text-[#8063F7] transition-colors group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#292D45] group-hover:bg-[#8063F7] transition-colors" />
                          <span className="truncate">{item.label}</span>
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Incorporated CTA block from the bottom horizontal card */}
                <div className="pt-4 border-t border-[#292D45]/60 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-heading font-bold text-[#F5F6FC]">
                      {t('haveSimilarProblem') || 'Have a similar challenge?'}
                    </h4>
                    <p className="text-xs text-[#A5ABC1] leading-relaxed">
                      Let's discuss your project requirements and architect a robust solution.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="w-full rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/25 hover:from-[#7154e6] hover:to-[#3e5edb] hover:shadow-[#8063F7]/40 active:scale-95 transition-all"
                  >
                    <Link href="/contact" className="flex items-center justify-center gap-2">
                      <span>{t('getInTouch')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

