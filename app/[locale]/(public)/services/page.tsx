
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPublicServices } from '@/server/services/serviceService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';




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

import { getTranslations } from 'next-intl/server';

import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { ImageIcon } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {servicesWithImages.map(service => (
          <Card key={service.id} className="animated-card">
            {service.mediaObj ? (
              <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
                <MediaRenderer url={service.mediaObj.url} mimeType={service.mediaObj.mimeType} altText={service.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-primary/40" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="font-sans leading-relaxed text-slate-600 dark:text-slate-400">{service.summary}</p>
              {service.startingPriceRange && (
                <p className="font-semibold text-sm">{t('startingAt')} {service.startingPriceRange}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/services/${service.slug}`}>{t('viewDetails')}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
