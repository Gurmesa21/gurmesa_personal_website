import { getPublicServices } from '@/server/services/serviceService';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { ContentCard } from '@/components/ui/ContentCard';
import { isTestMode } from '@/lib/test-mode';
import { unstable_noStore as noStore } from 'next/cache';
import {
  Code2,
  Cpu,
  Layers,
  Palette,
  Server,
  ArrowUpRight,
} from 'lucide-react';

export const revalidate = 3600;
export const dynamic = 'auto';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'am' }, { locale: 'om' }];
}

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

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (isTestMode()) {
    noStore();
  }

  const t = await getTranslations('Services');
  const services = await getPublicServices();

  const storage = getStorageAdapter();
  const servicesWithImages = await Promise.all(services.map(async (service) => {
    let mediaObj = null;
    try {
      if (service.featuredImageId) {
        const media = (service as any).featuredImage || await prisma.mediaAsset.findUnique({
          where: { id: service.featuredImageId }
        });
        if (media) {
          mediaObj = {
            url: await storage.getUrl(media.storageKey),
            mimeType: media.mimeType,
            altText: media.altText || service.title,
          };
        }
      }
    } catch {
      // Fallback gracefully
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 md:py-6">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#858EA8] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#292D45] bg-[#101426]">
              <Code2 className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
              {t('title')}
            </span>
          </div>

          <h1 className="sr-only">
            {t('title')}
          </h1>
        </div>

        {/* Services Grid: unified responsive 3-column layout, items-stretch */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 items-stretch">
          {servicesWithImages.map((service) => {
            const ServiceIcon = getServiceIcon(service.slug);
            return (
              <ContentCard
                key={service.id}
                href={`/services/${service.slug}`}
                media={service.mediaObj}
                fallbackIcon={ServiceIcon}
                title={service.title}
                description={service.summary}
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8063F7]/30 bg-[#171D32]/80 text-[#8063F7] shadow-inner transition-colors group-hover:text-[#A995FF] group-hover:border-[#8063F7]/50 backdrop-blur-sm">
                    <ServiceIcon className="h-5 w-5" />
                  </div>
                }
                footerLeft={
                  service.startingPriceRange ? (
                    <span className="break-words">
                      {t('startingAt')}{' '}
                      <span className="font-semibold text-[#F5F6FC]">{service.startingPriceRange}</span>
                    </span>
                  ) : (
                    <span>Available on request</span>
                  )
                }
                footerCta={
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3.5 rounded-lg border border-[#8063F7]/40 bg-[#8063F7]/10 text-xs sm:text-sm font-semibold text-[#A995FF] hover:bg-[#8063F7] hover:text-white hover:border-[#8063F7] group-hover:bg-[#8063F7] group-hover:text-white group-hover:border-[#8063F7] transition-all duration-200"
                  >
                    <span>{t('viewDetails')}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
