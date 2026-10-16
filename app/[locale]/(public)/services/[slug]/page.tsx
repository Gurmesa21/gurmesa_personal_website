export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicServiceBySlug } from '@/server/services/serviceService';
import { Button } from '@/components/ui/button';
import { serializeJsonLd } from '@/lib/jsonLd';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import {
  ImageIcon,
  ChevronRight,
  Check,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const override = await getSeoOverride(`/services/${resolvedParams.slug}`);
  const service = await getPublicServiceBySlug(resolvedParams.slug);
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || service?.title || 'Service',
    description: override?.description || service?.summary || 'Service details.',
    alternates: { canonical: override?.canonical || `${siteUrl}/services/${resolvedParams.slug}` },
    openGraph: {
      title: override?.title || service?.title || 'Service',
      description: override?.description || service?.summary,
      url: `${siteUrl}/services/${resolvedParams.slug}`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('Services');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  const service = await getPublicServiceBySlug((await params).slug);

  if (!service) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": `${siteUrl}/services` },
      { "@type": "ListItem", "position": 3, "name": service.title, "item": `${siteUrl}/services/${(await params).slug}` }
    ]
  };

  let mediaObj = null;
  if (service.featuredImageId) {
    const storage = getStorageAdapter();
    const media = await prisma.mediaAsset.findUnique({ where: { id: service.featuredImageId } });
    if (media) mediaObj = { url: await storage.getUrl(media.storageKey), mimeType: media.mimeType, altText: media.altText };
  }

  const phases = [
    { step: t('phase1Step'), desc: t('phase1Desc'), num: '01' },
    { step: t('phase2Step'), desc: t('phase2Desc'), num: '02' },
    { step: t('phase3Step'), desc: t('phase3Desc'), num: '03' },
    { step: t('phase4Step'), desc: t('phase4Desc'), num: '04' },
    { step: t('phase5Step'), desc: t('phase5Desc'), num: '05' },
    { step: t('phase6Step'), desc: t('phase6Desc'), num: '06' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 lg:space-y-10">
        {/* Compact Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#A5ABC1]">
          <Link href="/" className="hover:text-[#F5F6FC] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#292D45]" />
          <Link href="/services" className="hover:text-[#F5F6FC] transition-colors">Services</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#292D45]" />
          <span className="text-[#F5F6FC] font-medium truncate max-w-[240px] sm:max-w-md">{service.title}</span>
        </nav>

        {/* Compact Service Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#A995FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />
              Service
            </span>
            {service.startingPriceRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[#292D45] bg-[#101426] text-[#A5ABC1]">
                {t('startingAt')} <strong className="ml-1 text-[#F5F6FC]">{service.startingPriceRange}</strong>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-[#F5F6FC] leading-tight">
            {service.title}
          </h1>

          <p className="text-base sm:text-lg text-[#A5ABC1] max-w-4xl leading-relaxed">
            {service.summary}
          </p>
        </header>

        {/* Wide Featured Media Banner */}
        <div className="relative w-full aspect-[21/9] min-h-[260px] max-h-[440px] border border-[#292D45] bg-[#101426] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/100 hover:shadow-x2 hover:shadow-[#8063F7]/20 rounded-2xl overflow-hidden border border-[#292D45] bg-[#101426] shadow-2xl flex items-center justify-center">
          {mediaObj ? (
            <MediaRenderer
              url={mediaObj.url}
              mimeType={mediaObj.mimeType}
              altText={service.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-[#171D32] via-[#101426] to-[#171D32]/80 flex flex-col items-center justify-center gap-3">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#8063F7]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#4F6FF0]/15 blur-3xl" />
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8063F7]/30 bg-[#101426] text-[#8063F7] shadow-inner">
                <ImageIcon className="w-8 h-8 opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Service Content (~72% width on desktop) */}
          <main className="lg:col-span-8 space-y-8 lg:space-y-10 min-w-0">
            {/* Overview Section */}
            {service.description && (
              <section className="rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 space-y-6 shadow-xl shadow-black/40 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#F5F6FC]">
                  Overview
                </h2>
                <div className="prose prose-invert max-w-none text-[#A5ABC1] leading-relaxed text-sm sm:text-base">
                  <p className="whitespace-pre-wrap">{service.description}</p>
                </div>
              </section>
            )}

            {/* Deliverables Section */}
            {service.deliverables.length > 0 && (
              <section className="rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 space-y-6 shadow-xl shadow-black/40 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8063F7] shadow-sm shadow-[#8063F7]/40" />
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#F5F6FC]">
                    {t('whatYouGet')}
                  </h2>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {service.deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#292D45]/70 bg-[#171D32]/60 text-sm text-[#F5F6FC]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8063F7]/20 text-[#8063F7] font-bold text-xs mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Delivery Approach (Process) */}
            <section className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#4F6FF0]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A995FF]">Process</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#F5F6FC]">
                  {t('deliveryApproach')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {phases.map((phase, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-xl border border-[#292D45] bg-[#101426] p-4 sm:p-5 space-y-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8063F7]/60 hover:shadow-lg shadow-sm"
                  >
                    <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#8063F7] bg-[#8063F7]/10 border border-[#8063F7]/25 px-2 py-0.5 rounded">
                        {phase.num}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-[#F5F6FC] transition-colors group-hover:text-[#A995FF]">
                      {phase.step}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed">
                      {phase.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Compact Bottom CTA in Main Column */}
            <section className="relative overflow-hidden rounded-2xl border border-[#292D45] bg-gradient-to-r from-[#101426] via-[#171D32] to-[#101426] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl transition-all duration-300 hover:border-[#8063F7]/50">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-80" />
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#F5F6FC]">
                  {t('readyToGetStarted')}
                </h2>
                <p className="text-xs sm:text-sm text-[#A5ABC1] max-w-md">
                  {t('readyDescription')}
                </p>
              </div>
              <div className="shrink-0">
                <Button size="lg" asChild className="rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#8063F7]/25 hover:from-[#7154e6] hover:to-[#3e5edb] active:scale-95 transition-all">
                  <Link href="/contact" className="flex items-center gap-2">
                    <span>{t('startConversation')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </section>
          </main>

          {/* Supporting Inquiry Sidebar (~28% width on desktop) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 space-y-6 shadow-xl shadow-black/40 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10">
              <div>
                <span className="inline-block text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#A995FF] rounded-lg mb-3">
                  Service Inquiry
                </span>
                <h3 className="text-lg font-heading font-bold text-[#F5F6FC]">
                  Work With Me
                </h3>
                <p className="text-xs sm:text-sm text-[#A5ABC1] mt-1 leading-relaxed">
                  Have a project that requires {service.title.toLowerCase()}? Let's discuss your timeline and technical requirements.
                </p>
              </div>

              {/* Price card if available */}
              {service.startingPriceRange && (
                <div className="p-4 rounded-xl border border-[#292D45] bg-[#171D32]/80 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
                    {t('startingAt')}
                  </span>
                  <div className="text-2xl font-heading font-extrabold text-[#F5F6FC]">
                    {service.startingPriceRange}
                  </div>
                  <p className="text-[11px] text-[#A5ABC1]/80">
                    Scoped specifically to your deliverables and scale.
                  </p>
                </div>
              )}

              {/* Deliverables summary if available */}
              {service.deliverables.length > 0 && (
                <div className="pt-2 border-t border-[#292D45]/60 space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
                    Key Inclusions
                  </span>
                  <ul className="space-y-2 text-xs text-[#A5ABC1]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span>{service.deliverables.length} core deliverables</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8063F7] shrink-0" />
                      <span>Production-ready architecture & testing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#4F6FF0] shrink-0" />
                      <span>Transparent milestones & ongoing updates</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="pt-2 border-t border-[#292D45]/60 space-y-2.5">
                <Button asChild className="w-full rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#8063F7]/25 hover:from-[#7154e6] hover:to-[#3e5edb] active:scale-95 transition-all">
                  <Link href="/contact" className="flex items-center justify-center gap-2">
                    <span>{t('startConversation')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <div className="text-center pt-1">
                  <Link
                    href="/services"
                    className="inline-flex items-center text-xs text-[#A5ABC1] hover:text-[#8063F7] transition-colors"
                  >
                    ← View all services
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div >
    </>
  );
}

