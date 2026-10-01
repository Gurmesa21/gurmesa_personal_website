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

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  
  const project = await getPublicCaseStudyBySlug((await params).slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Work", "item": `${siteUrl}/work` },
      { "@type": "ListItem", "position": 3, "name": project?.title, "item": `${siteUrl}/work/${(await params).slug}` }
    ]
  };

  if (!project) {
    notFound(); // SEC-ACL-02 & SEC-ACL-03: return 404 for private/unpublished case studies.
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      
    <article className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
      {/* Header */}
      <header className="space-y-6 max-w-3xl border-b pb-8">
        <h1 className="text-4xl md:text-5xl font-bold">{project.title}</h1>
        <p className="text-xl text-muted-foreground">{project.summary}</p>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4">
          <div>
            <strong>Role:</strong> {project.role}
          </div>
          {project.publishedAt && (
            <div>
              <strong>Published:</strong> {new Date(project.publishedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.technologies.map(tech => (
            <Badge key={tech.id} variant="secondary">{tech.name}</Badge>
          ))}
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
        <section>
          <h2>The Problem</h2>
          <p className="whitespace-pre-wrap">{project.problem}</p>
        </section>
        
        <section>
          <h2>The Solution</h2>
          <p className="whitespace-pre-wrap">{project.solution}</p>
        </section>
        
        <section>
          <h2>Architecture</h2>
          <p className="whitespace-pre-wrap">{project.architectureSummary}</p>
        </section>
        
        {project.keyDecisions && (
          <section>
            <h2>Key Decisions</h2>
            <p className="whitespace-pre-wrap">{project.keyDecisions}</p>
          </section>
        )}
        
        {project.challenges && (
          <section>
            <h2>Challenges</h2>
            <p className="whitespace-pre-wrap">{project.challenges}</p>
          </section>
        )}
        
        <section>
          <h2>Outcome</h2>
          <p className="whitespace-pre-wrap">{project.outcome}</p>
        </section>

        <section>
          <h2>Deep Dive</h2>
          <div className="whitespace-pre-wrap">{project.content}</div>
        </section>
      </div>

      {/* CTA */}
      <section className="text-center space-y-6 pt-8 pb-12 border-t mt-16">
        <h2 className="text-3xl font-bold">Have a similar problem to solve?</h2>
        <Button size="lg" asChild>
          <Link href="/contact">Get in Touch</Link>
        </Button>
      </section>
    </article>
  </>
  );
}
