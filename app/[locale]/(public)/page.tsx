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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

import { User, ImageIcon } from 'lucide-react';
import { getStorageAdapter } from '@/lib/storage';
import { prisma } from '@/server/repositories/db';
import { MediaRenderer } from '@/components/ui/MediaRenderer';


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

export default async function HomePage(props?: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = props?.searchParams ? await props.searchParams : {};
  if (searchParams?.throwTestError === '1' && (process.env.NODE_ENV === 'development' || isTestMode())) {
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
    avatarMedia = { url: profile.avatarUrl, mimeType: isVideo ? 'video/mp4' : 'image/jpeg', altText: profile?.name || 'Avatar' };
  }

  const services = await getPublicServices();
  const projects = await getPublicProjects(); // Returns only published & non-private
  const posts = await getPublicPosts();
  const rawTestimonials = await testimonialService.getPublicTestimonials();
  const testimonials = rawTestimonials.map(toPublicTestimonial);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "url": siteUrl,
        "name": profile?.name || "Portfolio",
      },
      {
        "@type": "Person",
        "name": profile?.name,
        "jobTitle": profile?.title,
        "description": profile?.bio,
        "url": siteUrl
      }
    ]
  };


  return (
    <>
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <div className="flex flex-col gap-16 py-12">
        {/* Hero Section */}
        <section className="container mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {profile?.name || 'Hello'}
            </h1>
            <p className="text-2xl font-sans leading-relaxed text-blue-600 dark:text-teal-400">
              {profile?.title}
            </p>
            <p className="text-lg font-sans leading-relaxed text-slate-600 dark:text-slate-400">
              {profile?.tagline}
            </p>
            <div className="pt-4">
              <Button asChild size="lg">
                <Link href="/contact">{t('getInTouch')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Work Section */}
        <section className="container mx-auto px-4 p-8 md:p-12 animated-container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{t('featuredWork')}</h2>
            <Button asChild className='pt-4'>
              <Link href="/work">{t('viewPortfolio')}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(await Promise.all(projects.slice(0, 2).map(async project => {
              let mediaObj = null;
              const storage = getStorageAdapter();
              const pm = await prisma.projectMedia.findFirst({ where: { projectId: project.id, order: 0 }, include: { media: true } });
              if (pm?.media) mediaObj = { url: await storage.getUrl(pm.media.storageKey), mimeType: pm.media.mimeType, altText: pm.media.altText };
              return { ...project, mediaObj };
            }))).map((project) => (
              <Card key={project.id} className="animated-card">
                {project.mediaObj ? (
                  <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
                    <MediaRenderer url={project.mediaObj.url} mimeType={project.mediaObj.mimeType} altText={project.mediaObj.altText || project.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="font-sans leading-relaxed text-slate-600 dark:text-slate-400">{project.summary}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/work/${project.slug}`}>{t('readCaseStudy')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Services Preview Section */}
        <section className="container mx-auto px-4 p-8 md:p-12 animated-container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{t('servicesTitle')}</h2>
            <Button className='pt-4' asChild>
              <Link href="/services">{t('viewAllServices')}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(await Promise.all(services.slice(0, 3).map(async service => {
              let mediaObj = null;
              const storage = getStorageAdapter();
              if (service.featuredImageId) {
                const media = await prisma.mediaAsset.findUnique({ where: { id: service.featuredImageId } });
                if (media) mediaObj = { url: await storage.getUrl(media.storageKey), mimeType: media.mimeType, altText: media.altText };
              }
              return { ...service, mediaObj };
            }))).map((service) => (
              <Card key={service.id} className="animated-card">
                {service.mediaObj ? (
                  <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
                    <MediaRenderer url={service.mediaObj.url} mimeType={service.mediaObj.mimeType} altText={service.mediaObj.altText || service.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="font-sans leading-relaxed text-slate-600 dark:text-slate-400">{service.summary}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/services/${service.slug}`}>{t('learnMore')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Selected Writing Section */}
        <section className="container mx-auto px-4 p-8 md:p-12 mb-12 animated-container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{t('selectedWriting')}</h2>
            <Button className='pt-4' asChild>
              <Link href="/blog">{t('viewAllPosts')}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(await Promise.all(posts.slice(0, 3).map(async post => {
              let mediaObj = null;
              const storage = getStorageAdapter();
              if (post.featuredImage?.storageKey) {
                mediaObj = { url: await storage.getUrl(post.featuredImage.storageKey), mimeType: post.featuredImage.mimeType, altText: post.featuredImage.altText };
              }
              return { ...post, mediaObj };
            }))).map((post) => (
              <Card key={post.id} className="animated-card">
                {post.mediaObj ? (
                  <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden">
                    <MediaRenderer url={post.mediaObj.url} mimeType={post.mediaObj.mimeType} altText={post.mediaObj.altText || post.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="font-sans leading-relaxed text-slate-600 dark:text-slate-400">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/blog/${post.slug}`}>{t('readArticle')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* About Snapshot Section */}
        <section className="container mx-auto px-4 mb-12">
          <div className="mb-6 flex items-center justify-between max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{t('aboutMe')}</h2>
          </div>
          <div className="animated-container relative w-full max-w-4xl mx-auto p-0">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 h-40 sm:h-56 w-full relative rounded-t-2xl">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background"></div>
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <Button variant="default" asChild size="sm" className="rounded-full shadow-sm">
                  <Link href="/about">{t('readFullBio')}</Link>
                </Button>
              </div>
            </div>

            <div className="px-6 pb-8 sm:px-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 mb-6 gap-6">
                <div className="shrink-0 rounded-full overflow-hidden w-28 h-28 sm:w-40 sm:h-40 relative border-4 sm:border-8 border-card dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-md z-10">
                  {avatarMedia ? (
                    <MediaRenderer url={avatarMedia.url} mimeType={avatarMedia.mimeType} altText={profile?.name || 'Avatar'} fill className="object-cover" />
                  ) : (
                    <User className="w-14 h-14 sm:w-20 sm:h-20 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>

                <div className="flex flex-wrap gap-3 items-center z-10 pb-2">
                  {socialLinks.map(link => (
                    <Button key={link.id} variant="outline" size="sm" asChild className="rounded-full shadow-sm hover:shadow transition-all">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </Button>
                  ))}
                  {resumeUrl && (
                    <Button asChild size="sm" className="rounded-full shadow-sm">
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer">{t('downloadResume')}</a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{profile?.name || t('aboutMe')}</h2>
                  <p className="text-primary text-base font-medium mb-3">{profile?.title}</p>
                  {(profile?.locationLabel || profile?.availabilityStatus) && (
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                      {profile?.locationLabel && (
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                          {profile.locationLabel}
                        </span>
                      )}
                      {profile?.availabilityStatus && (
                        <span className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          {profile.availabilityStatus}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-lg font-sans leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {profile?.bio}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="container mx-auto px-4 p-8 md:p-12 mb-12 animated-container">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold tracking-tight text-slate-900 dark:text-slate-50">{t('whatPeopleSay')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                  <blockquote className="text-gray-700 dark:text-gray-300 italic mb-4">
                    &quot;{testimonial.content}&quot;
                  </blockquote>
                  <div className="border-t dark:border-slate-700 pt-4">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name || t('anonymous')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} {testimonial.organization && `${t('at')} ${testimonial.organization}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
