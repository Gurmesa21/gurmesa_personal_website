import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicCaseStudyBySlug } from '@/server/services/projectService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { serializeJsonLd } from '@/lib/jsonLd';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const override = await getSeoOverride(`/work/${resolvedParams.slug}`);
  const project = await getPublicCaseStudyBySlug(resolvedParams.slug);
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || project?.title || 'Case Study',
    description: override?.description || project?.summary || 'Project details.',
    alternates: { canonical: override?.canonical || `${siteUrl}/work/${resolvedParams.slug}` },
    openGraph: {
      title: override?.title || project?.title || 'Case Study',
      description: override?.description || project?.summary,
      url: `${siteUrl}/work/${resolvedParams.slug}`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { getTranslations } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { ImageIcon } from 'lucide-react';

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('Work');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  const project = await getPublicCaseStudyBySlug((await params).slug);
  
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
        {/* Featured Image */}
        <div className="max-w-3xl mx-auto shadow-sm rounded-t-2xl overflow-hidden border border-b-0 border-slate-200 dark:border-slate-800">
          {featuredImage ? (
            <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
              <MediaRenderer url={featuredImage.url!} mimeType={featuredImage.mimeType} altText={featuredImage.altText} fill className="object-cover" />
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-primary/40" />
            </div>
          )}
        </div>

        {/* Header */}
        <section className="space-y-6 text-center max-w-3xl mx-auto mt-0 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold">{project.title}</h1>
          <p className="text-xl text-muted-foreground">{project.summary}</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-4">
            <div>
              <strong>{t('role')}:</strong> {project.role}
            </div>
            {project.publishedAt && (
              <div>
                <strong>{t('published')}:</strong> {new Date(project.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {project.technologies.map(tech => (
              <Badge key={tech.id} variant="secondary">{tech.name}</Badge>
            ))}
          </div>
        </section>

        {/* Description / Content */}
        <section className="prose prose-lg dark:prose-invert max-w-none space-y-12">
          
          {project.problem && (
            <div>
              <h2 className="text-2xl font-bold">{t('theProblem')}</h2>
              <p className="whitespace-pre-wrap">{project.problem}</p>
            </div>
          )}
          
          {project.solution && (
            <div>
              <h2 className="text-2xl font-bold">{t('theSolution')}</h2>
              <p className="whitespace-pre-wrap">{project.solution}</p>
            </div>
          )}
          
          {project.architectureSummary && (
            <div>
              <h2 className="text-2xl font-bold">{t('architecture')}</h2>
              <p className="whitespace-pre-wrap">{project.architectureSummary}</p>
            </div>
          )}
          
          {project.keyDecisions && (
            <div>
              <h2 className="text-2xl font-bold">{t('keyDecisions')}</h2>
              <p className="whitespace-pre-wrap">{project.keyDecisions}</p>
            </div>
          )}
          
          {project.challenges && (
            <div>
              <h2 className="text-2xl font-bold">{t('challenges')}</h2>
              <p className="whitespace-pre-wrap">{project.challenges}</p>
            </div>
          )}
          
          {project.outcome && (
            <div>
              <h2 className="text-2xl font-bold">{t('outcome')}</h2>
              <p className="whitespace-pre-wrap">{project.outcome}</p>
            </div>
          )}

          {project.content && (
            <div>
              <h2 className="text-2xl font-bold">{t('deepDive')}</h2>
              <MarkdownRenderer content={project.content} />
            </div>
          )}
        </section>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section className="space-y-6 bg-muted/50 rounded-xl p-8 border">
            <h2 className="text-2xl font-bold">{t('gallery') || 'Gallery'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map(img => (
                <div key={img.id} className="relative w-full aspect-square rounded-xl overflow-hidden border">
                  <MediaRenderer url={img.url!} mimeType={img.mimeType} altText={img.altText} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center space-y-6 pt-8 pb-12 border-t">
          <h2 className="text-3xl font-bold">{t('haveSimilarProblem')}</h2>
          <Button size="lg" asChild>
            <Link href="/contact">{t('getInTouch')}</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
