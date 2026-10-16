import { getAdminServices } from '../../../../server/services/serviceService';
import { Button } from '../../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import Link from 'next/link';
import { togglePublishAction, deleteServiceAction, moveServiceAction } from './actions';

export default async function AdminServicesPage() {
  const services = await getAdminServices();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">Add Service</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={service.id} data-testid="admin-row">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <Badge variant={service.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {service.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <form action={moveServiceAction.bind(null, service.id, service.order - 1)}>
                  <Button variant="outline" size="sm" type="submit" disabled={index === 0}>Up</Button>
                </form>
                <form action={moveServiceAction.bind(null, service.id, service.order + 1)}>
                  <Button variant="outline" size="sm" type="submit" disabled={index === services.length - 1}>Down</Button>
                </form>
                <form action={togglePublishAction.bind(null, service.id, service.status)}>
                  <Button variant="secondary" size="sm" type="submit">
                    {service.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </Button>
                </form>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/services/${service.id}/edit`} data-testid="edit-link">Edit</Link>
                </Button>
                <form action={deleteServiceAction.bind(null, service.id)}>
                  <Button variant="destructive" size="sm" type="submit">Delete</Button>
                </form>
              </div>
            </CardHeader>
            <CardContent className="py-0 pb-4 text-sm text-muted-foreground">
              {service.summary}
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && (
          <p className="text-muted-foreground">No services found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
