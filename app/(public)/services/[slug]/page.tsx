import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicServiceBySlug } from '../../../../server/services/serviceService';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { serializeJsonLd } from '@/lib/jsonLd';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const override = await getSeoOverride(`/services/${resolvedParams.slug}`);
  const service = await getPublicServiceBySlug(resolvedParams.slug);
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || service?.title || 'Service',
    description: override?.description || service?.summary || 'Service details.',
    alternates: { canonical: override?.canonical || `${siteUrl}/services/${resolvedParams.slug}` },
    openGraph: {
      title: override?.title || service?.title || 'Service',
      description: override?.description || service?.summary,
      url: `${siteUrl}/services/${resolvedParams.slug}`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  
  const service = await getPublicServiceBySlug((await params).slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": `${siteUrl}/services` },
      { "@type": "ListItem", "position": 3, "name": service?.title, "item": `${siteUrl}/services/${(await params).slug}` }
    ]
  };

  if (!service) {
    notFound();
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
      {/* Header */}
      <section className="space-y-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">{service.title}</h1>
        <p className="text-xl text-muted-foreground">{service.summary}</p>
        {service.startingPriceRange && (
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Starting at {service.startingPriceRange}
          </Badge>
        )}
      </section>

      {/* Description */}
      <section className="prose prose-lg dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap">{service.description}</p>
      </section>

      {/* Deliverables */}
      {service.deliverables.length > 0 && (
        <section className="space-y-6 bg-muted/50 rounded-xl p-8 border">
          <h2 className="text-2xl font-bold">What you get</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.deliverables.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Delivery Approach (FR-SVC-03) */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Delivery Approach</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { step: '1. Discovery', desc: 'Understanding requirements and goals.' },
            { step: '2. Design', desc: 'Architecture and user experience planning.' },
            { step: '3. Development', desc: 'Iterative coding and feature implementation.' },
            { step: '4. Testing', desc: 'Rigorous QA and automated testing.' },
            { step: '5. Deployment', desc: 'Smooth transition to production.' },
            { step: '6. Support', desc: 'Ongoing maintenance and optimization.' },
          ].map((phase, i) => (
            <div key={i} className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">{phase.step}</h3>
              <p className="text-sm text-muted-foreground">{phase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-6 pt-8 pb-12 border-t">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Let&apos;s discuss how this service can help you achieve your goals. 
          Contact me today for a free consultation.
        </p>
        <Button size="lg" asChild>
          <Link href="/contact">Start a Conversation</Link>
        </Button>
      </section>
    </div>
  </>
  );
}
