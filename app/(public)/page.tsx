import { Metadata } from 'next';
import { getSeoOverride } from '../../server/services/seoService';
import { serializeJsonLd } from '../../lib/jsonLd';

import Link from 'next/link';
import { getPublicProfile } from '@/server/services/profileService';
import { getPublicServices } from '@/server/services/serviceService';
import { getPublicProjects } from '@/server/services/projectService';
import { getPublicPosts } from '@/server/services/blogService';
import { testimonialService } from '@/server/services/testimonialService';
import { toPublicTestimonial } from '@/lib/dto/testimonial';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';


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
  if (searchParams?.throwTestError === '1' && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' || process.env.PLAYWRIGHT_TEST === '1')) {
    throw new Error('simulated secret internal server error postgres://secret@db');
  }
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  
  const profile = await getPublicProfile();
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      
    <div className="flex flex-col gap-16 py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            {profile?.name || 'Hello'}
          </h1>
          <p className="text-2xl text-muted-foreground">
            {profile?.title}
          </p>
          <p className="text-lg">
            {profile?.tagline}
          </p>
          <div className="pt-4">
            <Button asChild size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="container mx-auto px-4 bg-muted/30 py-12 rounded-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Work</h2>
          <Button variant="outline" asChild>
            <Link href="/work">View Portfolio</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.slice(0, 2).map((project) => (
            <Card key={project.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">{project.summary}</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" asChild className="w-full">
                  <Link href={`/work/${project.slug}`}>Read Case Study</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Services</h2>
          <Button variant="outline" asChild>
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 3).map((service) => (
            <Card key={service.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">{service.summary}</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" asChild className="w-full">
                  <Link href={`/services/${service.slug}`}>Learn More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Selected Writing Section */}
      <section className="container mx-auto px-4 bg-muted/30 py-12 rounded-2xl mb-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Selected Writing</h2>
          <Button variant="outline" asChild>
            <Link href="/blog">View All Posts</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post) => (
            <Card key={post.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" asChild className="w-full">
                  <Link href={`/blog/${post.slug}`}>Read Article</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* About Snapshot Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-3xl font-bold">About Me</h2>
          <p className="text-lg text-muted-foreground whitespace-pre-wrap">
            {profile?.bio}
          </p>
          <div>
            <Button variant="outline" asChild>
              <Link href="/about">Read Full Bio</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="container mx-auto px-4 bg-muted/30 py-12 rounded-2xl mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">What People Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col h-full">
                <CardContent className="flex-1 pt-6">
                  <blockquote className="text-lg italic text-muted-foreground">
                    &quot;{testimonial.content}&quot;
                  </blockquote>
                </CardContent>
                <CardFooter className="flex flex-col items-start border-t pt-4">
                  <p className="font-semibold">{testimonial.name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} {testimonial.organization && `at ${testimonial.organization}`}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
