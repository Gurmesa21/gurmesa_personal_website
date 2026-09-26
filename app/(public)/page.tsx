import Link from 'next/link';
import { getPublicProfile } from '@/server/services/profileService';
import { getPublicServices } from '@/server/services/serviceService';
import { getPublicProjects } from '@/server/services/projectService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default async function HomePage() {
  const profile = await getPublicProfile();
  const services = await getPublicServices();
  const projects = await getPublicProjects(); // Returns only published & non-private

  return (
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

      {/* 
        TECHNICAL DEBT NOTE:
        Featured Work, Selected Writing, and Testimonials sections are omitted from the homepage today 
        because their underlying entities (Project, BlogPost, Testimonial) do not yet have their full 
        DTOs/pages built out (scheduled for Days 6, 7, etc.). Rather than faking placeholder content, 
        they are intentionally skipped per Day 5 requirements.
      */}
    </div>
  );
}
