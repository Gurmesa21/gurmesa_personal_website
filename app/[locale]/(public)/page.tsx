import { Metadata } from 'next';
import { getSeoOverride } from '@/server/services/seoService';
import { serializeJsonLd } from '@/lib/jsonLd';
import { isTestMode } from '@/lib/test-mode';

import Link from 'next/link';
import Script from 'next/script';
import { getPublicProfile, getPublicSocialLinks } from '@/server/services/profileService';
import { getPublicServices } from '@/server/services/serviceService';
import { getPublicProjects } from '@/server/services/projectService';
import { getPublicPosts } from '@/server/services/blogService';
import { testimonialService } from '@/server/services/testimonialService';
import { getResumeUrl } from '@/server/services/mediaService';
import { toPublicTestimonial } from '@/lib/dto/testimonial';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

import {
  User,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Quote,
  MapPin,
  FileText,
  Code2,
  Cpu,
  Palette,
  Server,
  Layers
} from 'lucide-react';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';

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

function formatTechName(slug: string): string {
  const map: Record<string, string> = {
    react: 'React',
    nextjs: 'Next.js',
    'next.js': 'Next.js',
    nodejs: 'Node.js',
    'node.js': 'Node.js',
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
  const lower = slug.toLowerCase().trim();
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
  technologies?: { id?: string; name: string; slug: string }[];
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

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const override = await getSeoOverride('/');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || 'Gurmesa - Full Stack Developer',
    description: override?.description || 'Personal portfolio and developer blog.',
    alternates: { canonical: override?.canonical || siteUrl },
    openGraph: {
      title: override?.title || 'Gurmesa - Full Stack Developer',
      description: override?.description || 'Personal portfolio and developer blog.',
      url: siteUrl,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function HomePage(props?: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = props?.searchParams ? await props.searchParams : {};
  if (
    searchParams?.throwTestError === '1' &&
    (process.env.NODE_ENV === 'development' || isTestMode())
  ) {
    throw new Error('simulated secret internal server error postgres://secret@db');
  }
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  const t = await getTranslations('Home');
  const profile = await getPublicProfile();
  const socialLinks = await getPublicSocialLinks();
  const resumeUrl = await getResumeUrl();

  let avatarMedia = null;
  if (profile?.avatarUrl) {
    const isVideo = profile.avatarUrl.endsWith('.mp4') || profile.avatarUrl.endsWith('.webm');
    avatarMedia = {
      url: profile.avatarUrl,
      mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
      altText: profile?.name || 'Avatar'
    };
  }

  const rawServices = await getPublicServices();
  const rawProjects = await getPublicProjects();
  const rawPosts = await getPublicPosts();
  const rawTestimonials = await testimonialService.getPublicTestimonials();

  // Testimonials: filter & sort to display only the last 2 most recent testimonials
  const sortedTestimonials = [...rawTestimonials].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const testimonials = sortedTestimonials.slice(0, 2).map(toPublicTestimonial);

  // Pre-resolve media for ALL projects (fully dynamic list for public homepage)
  const storage = getStorageAdapter();
  const projects = await Promise.all(
    rawProjects.map(async (project) => {
      let mediaObj = null;
      try {
        const pm = await prisma.projectMedia.findFirst({
          where: { projectId: project.id, order: 0 },
          include: { media: true }
        });
        if (pm?.media) {
          mediaObj = {
            url: await storage.getUrl(pm.media.storageKey),
            mimeType: pm.media.mimeType,
            altText: pm.media.altText || project.title
          };
        }
      } catch {
        // Fallback gracefully if storage read fails
      }
      return { ...project, mediaObj };
    })
  );

  // Pre-resolve media for ALL services (fully dynamic list for public homepage)
  const services = await Promise.all(
    rawServices.map(async (service) => {
      let mediaObj = null;
      try {
        if (service.featuredImageId) {
          const media = await prisma.mediaAsset.findUnique({
            where: { id: service.featuredImageId }
          });
          if (media) {
            mediaObj = {
              url: await storage.getUrl(media.storageKey),
              mimeType: media.mimeType,
              altText: media.altText || service.title
            };
          }
        }
      } catch {
        // Fallback gracefully
      }
      return { ...service, mediaObj };
    })
  );

  // Pre-resolve media for only the last 2 most recent blog posts
  const recentPosts = rawPosts.slice(0, 2);
  const posts = await Promise.all(
    recentPosts.map(async (post) => {
      let mediaObj = null;
      try {
        if (post.featuredImage?.storageKey) {
          mediaObj = {
            url: await storage.getUrl(post.featuredImage.storageKey),
            mimeType: post.featuredImage.mimeType,
            altText: post.featuredImage.altText || post.title
          };
        }
      } catch {
        // Fallback gracefully
      }
      return { ...post, mediaObj };
    })
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        url: siteUrl,
        name: profile?.name || 'Portfolio'
      },
      {
        '@type': 'Person',
        name: profile?.name,
        jobTitle: profile?.title,
        description: profile?.bio,
        url: siteUrl
      }
    ]
  };

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="min-h-screen bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
        {/* Subtle Ambient Glow Highlights */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#8063F7]/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
          {/* =========================================================================
              MAIN CONTENT GRID — TWO COLUMNS (Desktop: ~65% Left / ~35% Right)
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-[13fr_7fr] gap-5 items-start">
            {/* -----------------------------------------------------------------------
                LEFT COLUMN (~65% width): Hero Developer Introduction + Services
               ----------------------------------------------------------------------- */}
            <div className="flex flex-col gap-5">
              {/* HERO CARD */}
              <section
                aria-label="Developer Introduction"
                className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-xl shadow-black/40 transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10"
              >
                {/* Thin Top Accent Line Animation */}
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                {/* Internal Violet/Blue Accent Aura */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#8063F7]/20 via-[#4F6FF0]/10 to-transparent blur-3xl" />

                <div className="relative z-10 space-y-4">
                  {/* Status Badges Row */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#292D45] bg-[#171D32] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />
                      {profile?.title || 'Full-Stack Developer'}
                    </span>

                    {profile?.availabilityStatus && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        {profile.availabilityStatus}
                      </span>
                    )}

                    {profile?.locationLabel && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#A5ABC1]">
                        <MapPin className="h-3.5 w-3.5 text-[#8063F7]" />
                        {profile.locationLabel}
                      </span>
                    )}
                  </div>

                  {/* Primary Single H1 Heading */}
                  <div>
                    <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#F5F6FC] sm:text-4xl lg:text-[2.65rem] leading-[1.12]">
                      {profile?.name || 'Gurmesa Teklemariam'}
                    </h1>
                    {profile?.tagline && (
                      <p className="mt-2 text-base font-medium text-[#F5F6FC]/90 sm:text-lg leading-snug">
                        {profile.tagline}
                      </p>
                    )}
                  </div>

                  {/* Concise Supporting Description */}
                  {profile?.bio && (
                    <p className="max-w-2xl text-xs sm:text-sm font-normal leading-relaxed text-[#A5ABC1] line-clamp-3">
                      {profile.bio}
                    </p>
                  )}

                  {/* Calls To Action */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      asChild
                      size="default"
                      className="rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-md shadow-[#8063F7]/25 transition-all hover:from-[#7154e6] hover:to-[#3e5edb] hover:shadow-[#8063F7]/40 active:scale-95"
                    >
                      <Link href="/contact">{t('getInTouch')}</Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="default"
                      className="rounded-xl border-[#292D45] bg-[#171D32]/80 px-5 py-2.5 text-xs sm:text-sm font-medium text-[#F5F6FC] transition-all hover:border-[#8063F7]/50 hover:bg-[#171D32] hover:text-white"
                    >
                      <Link href="/work">{t('viewPortfolio')}</Link>
                    </Button>

                    {resumeUrl && (
                      <Button
                        asChild
                        variant="ghost"
                        size="default"
                        className="rounded-xl px-3 text-xs font-medium text-[#A5ABC1] transition-colors hover:bg-[#171D32]/60 hover:text-[#F5F6FC]"
                      >
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#8063F7]" />
                          {t('downloadResume')}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </section>

              {/* SERVICES SECTION (SAME Left Column) */}
              <section aria-label="Services" className="space-y-3.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#8063F7] animate-pulse" />
                    <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F6FC] sm:text-2xl">
                      {t('servicesTitle')}
                    </h2>
                  </div>
                  <Link
                    href="/services"
                    className="group flex items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white sm:text-sm"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      {t('viewAllServices')}

                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {services.map((service) => {
                    const ServiceIcon = getServiceIcon(service.slug);
                    return (
                      <div
                        key={service.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#292D45] bg-[#101426] p-4.5 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10"
                      >
                        {/* Thin Top Accent Line Animation */}
                        <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                        {/* Static Background Media Layer: image stays static over all the card behind the text */}
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
                        <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-[#8063F7]/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />

                        <div className="relative z-10 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#8063F7]/30 bg-[#101426]/75 text-[#8063F7] shadow-inner backdrop-blur-md transition-colors group-hover:text-[#A995FF] group-hover:border-[#8063F7]/50 animate-pulse">
                              <ServiceIcon className="h-4.5 w-4.5" />
                            </div>

                            {service.startingPriceRange && (
                              <span className="rounded-full border border-[#8063F7]/30 bg-[#8063F7]/15 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#A995FF]">
                                {service.startingPriceRange}
                              </span>
                            )}
                          </div>

                          <div>
                            <h3 className="font-heading text-base font-bold tracking-tight text-[#F5F6FC] transition-colors group-hover:text-[#A995FF]">
                              {service.title}
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm font-normal leading-relaxed text-[#A5ABC1] line-clamp-2">
                              {service.summary}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 mt-3 flex items-center justify-between border-t border-[#292D45]/50 pt-2.5">
                          <Link
                            href={`/services/${service.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors group-hover:text-white"
                          >
                            {t('learnMore')}
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </Link>

                          {service.deliverables && service.deliverables.length > 0 && (
                            <span className="text-[10px] text-[#A5ABC1]/70">
                              {service.deliverables.length} deliverables
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* -----------------------------------------------------------------------
                RIGHT COLUMN (~35% width): Featured Work / Projects beside Hero & Services
               ----------------------------------------------------------------------- */}
            <aside aria-label="Featured Work" className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#4F6FF0] animate-pulse" />
                  <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F6FC] sm:text-2xl">
                    {t('featuredWork')}

                  </h2>
                </div>
                <Link
                  href="/work"
                  className="group flex items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white sm:text-sm"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    {t('viewPortfolio')}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>

                </Link>
              </div>

              {/* Vertical List of Compact Project Cards */}
              <div className="flex flex-col gap-3.5">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/work/${project.slug}`}
                    className="group relative block overflow-hidden rounded-xl border border-[#292D45] bg-[#101426] p-3 sm:p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10"
                  >
                    {/* Thin Top Accent Line Animation */}
                    <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                    {/* Static Background Media Layer: image stays static over all the card behind the text */}
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                      {project.mediaObj ? (
                        project.mediaObj.mimeType.startsWith('video/') ? (
                          <video
                            src={project.mediaObj.url}
                            className="h-full w-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
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
                            className="object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
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


                    <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-[#8063F7]/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />

                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#8063F7]/30 bg-[#101426]/75 text-[#8063F7] shadow-inner backdrop-blur-md transition-colors group-hover:text-[#A995FF] group-hover:border-[#8063F7]/50 animate-pulse">
                          <Layers className="h-5 w-5 animate-pulse" />
                        </div>

                        {project.role && (
                          <span className="rounded-full border border-[#8063F7]/30 bg-[#8063F7]/15 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#A995FF]">
                            {project.role}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-heading text-base font-bold tracking-tight text-[#F5F6FC] transition-colors group-hover:text-[#A995FF]">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm font-normal leading-relaxed text-[#A5ABC1] line-clamp-2">
                          {project.summary}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-2.5 flex items-center justify-between border-t border-[#292D45]/50 pt-2 text-xs">
                      {(() => {
                        const projectTags = getProjectTags(project);
                        return (
                          <div className="flex flex-wrap gap-1">
                            {projectTags.slice(0, 3).map((tech) => (
                              <span
                                key={tech.slug}
                                className="rounded-md border border-[#292D45] bg-[#8063F7]/15 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-[#A5ABC1]"
                              >
                                {tech.name}
                              </span>
                            ))}
                            {projectTags.length > 3 && (
                              <span className="rounded-md border border-[#292D45]/60 bg-[#171D32]/60 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-[#A5ABC1]">
                                +{projectTags.length - 3}
                              </span>
                            )}
                          </div>
                        );
                      })()}


                      <span className="ml-2 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors group-hover:text-white">
                        {t('readCaseStudy')}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}


              </div>
            </aside>
          </div>

          {/* =========================================================================
              BOTTOM ROW — THREE HORIZONTAL CARDS (Blog, About, Testimonials)
             ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-1">
            {/* -----------------------------------------------------------------------
                CARD 1: BLOG / WRITING
               ----------------------------------------------------------------------- */}
            <div className="group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              {/* Thin Top Accent Line Animation */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#292D45] bg-[#171D32] text-[#8063F7]">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#F5F6FC]">
                      {t('selectedWriting')}
                    </h2>
                  </div>
                  <Link

                    href="/blog"
                    className="group flex items-center gap-0.5 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      {t('viewAllPosts')}
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>

                {posts && posts.length > 0 ? (
                  <div className="space-y-2">
                    {posts.slice(0, 2).map((post, idx) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className={`block rounded-xl p-2.5 transition-colors ${idx === 0
                          ? 'border border-[#292D45]/80 bg-[#171D32]/60 hover:bg-[#171D32]'
                          : 'border border-[#292D45]/80 bg-[#171D32]/60 hover:bg-[#171D32]'
                          }`}
                      >
                        <h3 className="font-heading text-xs sm:text-sm font-semibold text-[#F5F6FC] transition-colors hover:text-[#A995FF] line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#A5ABC1] line-clamp-2">
                          {post.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center py-4">
                    <p className="text-xs leading-relaxed text-[#A5ABC1]">
                      Technical perspectives, architecture guides, and engineering insights.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#292D45]/60 pt-3">
                <Link
                  href={posts[0] ? `/blog/${posts[0].slug}` : '/blog'}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
                >
                  {t('readArticle')}
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span className="text-[11px] text-[#A5ABC1]">
                  {rawPosts.length} {rawPosts.length === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>

            {/* -----------------------------------------------------------------------
                CARD 2: ABOUT SUMMARY
               ----------------------------------------------------------------------- */}
            <div className="group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              {/* Thin Top Accent Line Animation */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {avatarMedia ? (
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#8063F7]/50 bg-[#171D32] flex items-center justify-center">
                        <MediaRenderer
                          url={avatarMedia.url}
                          mimeType={avatarMedia.mimeType}
                          altText={profile?.name || 'Avatar'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#292D45] bg-[#171D32] text-[#8063F7]">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#F5F6FC]">
                      {t('aboutMe')}
                    </h2>
                  </div>
                  <Link
                    href="/about"
                    className="group flex items-center gap-0.5 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      {t('learnMore')}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>

                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F5F6FC]">
                      {profile?.name || 'Gurmesa Teklemariam'}
                    </h3>
                    <p className="text-[11px] font-medium text-[#A995FF]">
                      {profile?.title}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#A5ABC1] line-clamp-3">
                    {profile?.bio}
                  </p>

                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 ">
                      {socialLinks.slice(0, 3).map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-[#292D45] bg-[#101426] p-5 shadow-lg shadow-black/30 px-2 py-0.5 text-[10px] font-medium text-[#A5ABC1] transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#292D45]/60 pt-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
                >
                  {t('readFullBio')}
                  <ArrowRight className="h-3 w-3" />
                </Link>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#A5ABC1] transition-colors hover:text-[#F5F6FC]"
                  >
                    {t('downloadResume')}
                  </a>
                )}
              </div>
            </div>

            {/* -----------------------------------------------------------------------
                CARD 3: TESTIMONIALS PREVIEW
               ----------------------------------------------------------------------- */}
            <div className="group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              {/* Thin Top Accent Line Animation */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#292D45] bg-[#171D32] text-[#8063F7]">
                      <Quote className="h-4 w-4" />
                    </div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#F5F6FC]">
                      {t('whatPeopleSay')}
                    </h2>
                  </div>
                  <Link
                    href="/testimonials"
                    className="group flex items-center gap-0.5 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />  All
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>

                {testimonials && testimonials.length > 0 ? (
                  <div className="space-y-2">
                    {testimonials.slice(0, 2).map((testimonial, idx) => (
                      <div
                        key={testimonial.id}
                        className={`rounded-xl p-2.5 ${idx === 0
                          ? 'border border-[#292D45]/80 bg-[#171D32]/60'
                          : 'border border-[#292D45]/40 bg-[#171D32]/30'
                          }`}
                      >
                        <blockquote className="text-xs italic leading-relaxed text-[#A5ABC1] max-h-24 sm:max-h-28 overflow-y-auto pr-1 [overflow-wrap:anywhere] break-words">
                          &ldquo;{testimonial.content}&rdquo;
                        </blockquote>
                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#F5F6FC] truncate">
                            {testimonial.name || t('anonymous')}
                          </span>
                          <span className="text-[10px] text-[#A5ABC1] truncate max-w-[120px]">
                            {testimonial.role}
                            {testimonial.organization && ` ${t('at')} ${testimonial.organization}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center py-4">
                    <blockquote className="text-xs italic leading-relaxed text-[#A5ABC1]">
                      &ldquo;Committed to delivering scalable architectures, resilient systems, and
                      reliable client partnerships.&rdquo;
                    </blockquote>
                    <p className="mt-2 text-[11px] font-medium text-[#A995FF]">
                      Open for client collaborations
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#292D45]/60 pt-3">
                <Link
                  href="/testimonials"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
                >
                  View Testimonials
                  <ArrowRight className="h-3 w-3" />
                </Link>
                {testimonials.length > 0 && (
                  <span className="text-[11px] text-[#A5ABC1]">
                    {testimonials.length} client{' '}
                    {testimonials.length === 1 ? 'review' : 'reviews'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
