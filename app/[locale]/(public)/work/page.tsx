import Link from 'next/link';
import { getPublicProjects } from '@/server/services/projectService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';





// Next 15 Server Component with search params

export async function generateMetadata(): Promise<Metadata> {
  const override = await getSeoOverride('/work');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || 'Portfolio',
    description: override?.description || 'My projects.',
    alternates: { canonical: override?.canonical || `${siteUrl}/work` },
    openGraph: {
      title: override?.title || 'Portfolio',
      url: `${siteUrl}/work`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

import { getTranslations } from 'next-intl/server';

import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { ImageIcon } from 'lucide-react';

export default async function WorkPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const t = await getTranslations('Work');
  const resolvedParams = await searchParams;
  let projects = await getPublicProjects();

  // Simple server-side filter for technology/tag if requested
  const tagFilter = typeof resolvedParams.tag === 'string' ? resolvedParams.tag : null;
  if (tagFilter) {
    projects = projects.filter(p => p.technologies.some(t => t.slug === tagFilter));
  }

  // Get all unique tags for the filter bar
  const allTags = Array.from(new Set(
    projects.flatMap(p => p.technologies.map(t => t.slug))
  )).sort();

  const storage = getStorageAdapter();
  const projectsWithImages = await Promise.all(projects.map(async (project) => {
    let mediaObj = null;
    const pm = await prisma.projectMedia.findFirst({
      where: { projectId: project.id, order: 0 },
      include: { media: true }
    });
    if (pm?.media) {
      mediaObj = { url: await storage.getUrl(pm.media.storageKey), mimeType: pm.media.mimeType, altText: pm.media.altText };
    }
    return { ...project, mediaObj };
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

      {/* Basic Filter Bar */}
      {allTags.length > 0 && (
        <section className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold mr-2">{t('filterByTech')}</span>
          <Button variant={!tagFilter ? "default" : "outline"} size="sm" asChild>
            <Link href="/work">{t('all')}</Link>
          </Button>
          {allTags.map(tag => (
            <Button key={tag} variant={tagFilter === tag ? "default" : "outline"} size="sm" asChild>
              <Link href={`/work?tag=${tag}`}>{tag}</Link>
            </Button>
          ))}
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projectsWithImages.map(project => (
          <Card key={project.id} className="animated-card">
            {project.mediaObj ? (
              <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
                <MediaRenderer url={project.mediaObj.url} mimeType={project.mediaObj.mimeType} altText={project.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-primary/40" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{project.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.technologies.slice(0, 3).map(tech => (
                  <Badge key={tech.id} variant="secondary" className="text-xs">{tech.name}</Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{project.technologies.length - 3}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="font-sans leading-relaxed text-slate-600 dark:text-slate-400">{project.summary}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/work/${project.slug}`}>{t('readCaseStudy')}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            {t('noCaseStudies')}
          </div>
        )}
      </div>
    </div>
  );
}
