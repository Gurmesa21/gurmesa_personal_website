
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPublicServices } from '@/server/services/serviceService';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import {
  Code2,
  Cpu,
  Layers,
  Palette,
  Server,
  ArrowUpRight,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const override = await getSeoOverride('/services');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || 'Services',
    description: override?.description || 'What I offer.',
    alternates: { canonical: override?.canonical || `${siteUrl}/services` },
    openGraph: {
      title: override?.title || 'Services',
      url: `${siteUrl}/services`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

function getServiceIcon(slug: string) {
  switch (slug) {
    case 'web-development':
      return Code2;
    case 'consulting':
    case 'technical-consulting':
      return Cpu;
    case 'ui-design':
    case 'ui-ux-design':
      return Palette;
    case 'caching-service':
      return Server;
    default:
      return Layers;
  }
}

export default async function ServicesPage() {
  const t = await getTranslations('Services');
  const services = await getPublicServices();

  const storage = getStorageAdapter();
  const servicesWithImages = await Promise.all(services.map(async (service) => {
    let mediaObj = null;
    if (service.featuredImageId) {
      const media = await prisma.mediaAsset.findUnique({ where: { id: service.featuredImageId } });
      if (media) mediaObj = { url: await storage.getUrl(media.storageKey), mimeType: media.mimeType, altText: media.altText };
    }
    return { ...service, mediaObj };
  }));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <h1 className="sr-only">{t('title')}</h1>

        {/* Services Grid: balanced two-column layout on desktop, 1 column on mobile, 16-20px gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {servicesWithImages.map((service) => {
            const ServiceIcon = getServiceIcon(service.slug);
            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 overflow-hidden min-h-[260px] sm:min-h-[280px]"
              >
                {/* Thin Top Accent Line Animation */}
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                {/* Static Background Media Layer: covers entire card behind text */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                  {service.mediaObj ? (
                    service.mediaObj.mimeType.startsWith('video/') ? (
                      <video
                        src={service.mediaObj.url}
                        className="h-full w-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <MediaRenderer
                        url={service.mediaObj.url}
                        mimeType={service.mediaObj.mimeType}
                        altText={service.title}
                        fill
                        className="object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    )
                  ) : (
                    <div className="relative h-full w-full bg-gradient-to-br from-[#8063F7]/25 via-[#171D32] to-[#101426]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#8063F7]/20 to-transparent" />
                    </div>
                  )}
                  {/* Gradient overlay: increased transparency so background image is clearly visible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B16]/92 via-[#080B16]/55 to-[#080B16]/35 group-hover:via-[#080B16]/45 group-hover:to-[#080B16]/25 transition-all duration-300" />
                </div>

                {/* Subtle hover radial glow */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#8063F7]/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />

                {/* Content hierarchy */}
                <div className="relative z-10 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8063F7]/30 bg-[#171D32]/80 text-[#8063F7] shadow-inner transition-colors group-hover:text-[#A995FF] group-hover:border-[#8063F7]/50 backdrop-blur-sm">
                        <ServiceIcon className="h-5 w-5 animate-pulse" />
                      </div>

                    </div>

                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F5F6FC] transition-colors group-hover:text-[#A995FF]">
                        {service.title}
                      </h2>
                      <p className="mt-1.5 text-sm font-normal text-[#A5ABC1] leading-relaxed line-clamp-3">
                        {service.summary}
                      </p>
                    </div>
                  </div>

                  {/* Footer action row with compact Details button */}
                  <div className="flex items-center justify-between border-t border-[#292D45]/60 pt-3.5 mt-auto">
                    <div className="text-xs text-[#A5ABC1]">
                      {service.startingPriceRange ? (
                        <span>
                          {t('startingAt')}{' '}
                          <span className="font-semibold text-[#F5F6FC]">{service.startingPriceRange}</span>
                        </span>
                      ) : (
                        <span>Available on request</span>
                      )}
                    </div>

                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3.5 rounded-lg border border-[#8063F7]/40 bg-[#8063F7]/10 text-xs sm:text-sm font-semibold text-[#A995FF] hover:bg-[#8063F7] hover:text-white hover:border-[#8063F7] transition-all duration-200 active:scale-95 ml-auto"
                    >
                      <span>{t('viewDetails')}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
