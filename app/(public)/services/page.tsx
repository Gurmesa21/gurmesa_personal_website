import Link from 'next/link';
import { getPublicServices } from '../../../server/services/serviceService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export const metadata = {
  title: 'Services | Gurmesa',
  description: 'Professional services offered.',
};

export default async function ServicesPage() {
  const services = await getPublicServices();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Services</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive full-stack development and consulting services.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map(service => (
          <Card key={service.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-muted-foreground">{service.summary}</p>
              {service.startingPriceRange && (
                <p className="font-semibold text-sm">Starting at {service.startingPriceRange}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/services/${service.slug}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
