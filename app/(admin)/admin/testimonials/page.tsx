import { testimonialService } from '@/server/services/testimonialService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Testimonials - Admin',
  robots: { index: false, follow: false }
};

export default async function TestimonialsPage() {
  const testimonials = await testimonialService.listAdminTestimonials();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Testimonials</h1>
      </div>

      <div className="space-y-4 min-w-0">
        {testimonials.map(t => (
          <Card key={t.id} data-testid="admin-row" className="min-w-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 min-w-0 gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-wrap">
                <CardTitle className="text-xl break-words [overflow-wrap:anywhere]">{t.name}</CardTitle>
                <Badge variant={t.status === 'PUBLISHED' ? 'default' : 'secondary'} className="shrink-0">
                  {t.status}
                </Badge>
                {t.isAnonymous && <Badge variant="outline" className="shrink-0">Anonymous</Badge>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/testimonials/${t.id}`} data-testid="edit-link">Edit</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-0 pb-4 text-sm text-muted-foreground flex flex-col gap-1 min-w-0">
              <p className="break-words [overflow-wrap:anywhere]">Role: {t.role || 'No role'} {t.organization ? `at ${t.organization}` : ''}</p>
              <p>Permission: {t.permissionStatus}</p>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <p className="text-muted-foreground">No testimonials found.</p>
        )}
      </div>
    </div>
  );
}
