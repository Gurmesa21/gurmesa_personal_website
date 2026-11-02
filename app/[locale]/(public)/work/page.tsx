import Link from 'next/link';
import { getPublicProjects } from '@/server/services/projectService';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { Layers, ArrowUpRight } from 'lucide-react';
import { isTestMode } from '@/lib/test-mode';
import { unstable_noStore as noStore } from 'next/cache';

export const revalidate = 60;
export const dynamic = 'auto';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'am' }, { locale: 'om' }];
}

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

function formatTechName(slug: string): string {
  const map: Record<string, string> = {
    react: 'React',
    nextjs: 'Next.js',
    nodejs: 'Node.js',
    prisma: 'Prisma',
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    tailwind: 'Tailwind CSS',
    tailwindcss: 'Tailwind CSS',
    postgres: 'PostgreSQL',
    postgresql: 'PostgreSQL',
    redis: 'Redis',
    python: 'Python',
    docker: 'Docker',
    graphql: 'GraphQL',
    aws: 'AWS',
  };
  const lower = slug.toLowerCase();
  if (map[lower]) {
    return map[lower];
  }
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getProjectTags(project: {
  slug: string;
  technologies: { id?: string; name: string; slug: string }[];
}) {
  const tags: { slug: string; name: string }[] = [];
  const seen = new Set<string>();

  // 1. Gather DB technologies
  if (project.technologies && project.technologies.length > 0) {
    for (const t of project.technologies) {
      const s = t.slug.trim().toLowerCase();
      if (s && !seen.has(s)) {
        seen.add(s);
        tags.push({ slug: s, name: t.name || formatTechName(s) });
      }
    }
  }

  // 2. Also check project.slug for comma-separated items or if no DB technologies exist
  if (project.slug) {
    const slugParts = project.slug
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);

    if (project.slug.includes(',') || tags.length === 0) {
      for (const part of slugParts) {
        if (!seen.has(part)) {
          seen.add(part);
          tags.push({ slug: part, name: formatTechName(part) });
        }
      }
    }
  }

  return tags;
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (isTestMode()) {
    noStore();
  }

  const t = await getTranslations('Work');
  const allProjects = await getPublicProjects();

  const storage = getStorageAdapter();
  const projectsWithImages = await Promise.all(
    allProjects.map(async (project) => {
      let mediaObj = null;
      try {
        const pm = (project as any).media?.[0] || await prisma.projectMedia.findFirst({
          where: { projectId: project.id, order: 0 },
          include: { media: true },
        });
        if (pm?.media) {
          mediaObj = {
            url: await storage.getUrl(pm.media.storageKey),
            mimeType: pm.media.mimeType,
            altText: pm.media.altText || project.title,
          };
        }
      } catch {
        // Fallback gracefully
      }
      return { ...project, mediaObj };
    })
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 md:py-6">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#858EA8] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#292D45] bg-[#101426]">
              <Layers className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
              {t('title')}
            </span>
          </div>

          <h1 className="sr-only">
            {t('title')}
          </h1>
        </div>

        {/* Project Grid: 2 balanced columns desktop, 1 column on mobile, 16-20px gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {projectsWithImages.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 overflow-hidden aspect-video"
            >
              {/* Thin Top Accent Line Animation */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

              {/* Static Background Media Layer: covers entire card behind text */}
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#080B16] flex items-center justify-center">
                {project.mediaObj ? (
                  project.mediaObj.mimeType.startsWith('video/') ? (
                    <video
                      src={project.mediaObj.url}
                      className="h-full w-full object-contain scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <MediaRenderer
                      url={project.mediaObj.url}
                      mimeType={project.mediaObj.mimeType}
                      altText={project.mediaObj.altText || project.title}
                      fill
                      className="object-contain scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )
                ) : (
                  <div className="relative h-full w-full bg-gradient-to-br from-[#4F6FF0]/25 via-[#171D32] to-[#101426]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#8063F7]/20 to-transparent" />
                  </div>
                )}
                {/* Gradient overlay: increased transparency so background image is clearly visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B16]/92 via-[#080B16]/55 to-[#080B16]/35 group-hover:via-[#080B16]/45 group-hover:to-[#080B16]/25 transition-all duration-300" />
              </div>

              {/* Subtle hover radial glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#8063F7]/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />

              {/* Content area */}
              <div className="relative z-10 flex flex-col flex-1 justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#4F6FF0]/30 bg-[#171D32]/80 text-[#4F6FF0] shadow-inner transition-colors group-hover:text-[#8063F7] group-hover:border-[#8063F7]/50 backdrop-blur-sm">
                    <Layers className="h-5 w-5 animate-pulse" />
                  </div>
                  {project.role && (
                    <span className="rounded-full border border-[#8063F7]/30 bg-[#8063F7]/15 backdrop-blur-md px-2.5 py-0.5 text-xs sm:text-[13px] font-semibold text-[#A995FF]">
                      {project.role}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F5F6FC] transition-colors group-hover:text-[#A995FF]">
                    {project.title}
                  </h2>
                  <p className="text-sm font-normal text-[#A5ABC1] leading-relaxed line-clamp-3">
                    {project.summary}
                  </p>
                </div>

                {/* Technology badges row */}
                {(() => {
                  const projectTags = getProjectTags(project);
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-4 border-t border-[#292D45]/60">
                      {projectTags.slice(0, 4).map((tech) => (
                        <span
                          key={tech.slug}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-[#292D45] bg-[#171D32]/80 text-[#A5ABC1]"
                        >
                          {tech.name}
                        </span>
                      ))}
                      {projectTags.length > 4 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-[#292D45]/60 bg-[#171D32]/60 text-[#A5ABC1]">
                          +{projectTags.length - 4}
                        </span>
                      )}
                      <Link
                        href={`/work/${encodeURIComponent(project.slug)}`}
                        className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3.5 rounded-lg border border-[#8063F7]/40 bg-[#8063F7]/10 text-xs sm:text-sm font-semibold text-[#A995FF] hover:bg-[#8063F7] hover:text-white hover:border-[#8063F7] transition-all duration-200 active:scale-95 ml-auto"
                      >
                        <span>{t('readCaseStudy')}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 animate-pulse" />
                      </Link>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}

          {allProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#A5ABC1] border border-dashed border-[#292D45] rounded-2xl bg-[#101426]/50">
              {t('noCaseStudies')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
