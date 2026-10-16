import { testimonialService } from '@/server/services/testimonialService';
import { TestimonialStatus, TestimonialPermissionStatus } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export const metadata = {
  title: 'Edit Testimonial - Admin',
  robots: { index: false, follow: false }
};

export default async function TestimonialEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const t = await testimonialService.getAdminTestimonial(resolvedParams.id);
  
  if (!t) {
    notFound();
  }

  async function updateTestimonial(formData: FormData) {
    'use server';
    await testimonialService.updateTestimonial(t!.id, {
      status: formData.get('status') as TestimonialStatus,
      permissionStatus: formData.get('permissionStatus') as TestimonialPermissionStatus,
      featured: formData.get('featured') === 'on',
      isAnonymous: formData.get('isAnonymous') === 'on',
    });
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    redirect('/admin/testimonials');
  }

  async function deleteTestimonial() {
    'use server';
    await testimonialService.deleteTestimonial(t!.id);
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    redirect('/admin/testimonials');
  }

  return (
    <div className="space-y-6 max-w-3xl min-w-0">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Testimonial</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/testimonials">
            &larr; Back
          </Link>
        </Button>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="min-w-0">
          <CardTitle className="break-words [overflow-wrap:anywhere]">{t.name}</CardTitle>
          <p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">{t.role} {t.organization ? `at ${t.organization}` : ''}</p>
        </CardHeader>
        <CardContent className="space-y-6 min-w-0">
          <blockquote className="p-4 italic border-l-4 bg-muted text-foreground rounded-r-md break-words [overflow-wrap:anywhere] [word-break:break-word]">
            &quot;{t.content}&quot;
          </blockquote>

          <form action={updateTestimonial} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={t.status} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  {Object.values(TestimonialStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permissionStatus">Permission</Label>
                <select id="permissionStatus" name="permissionStatus" defaultValue={t.permissionStatus} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  {Object.values(TestimonialPermissionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" defaultChecked={t.featured} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isAnonymous" defaultChecked={t.isAnonymous} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Anonymous (hides name/org)</span>
              </label>
            </div>

            <div className="pt-4 flex justify-between items-center border-t">
              <Button type="submit">Save Changes</Button>
              <Button variant="destructive" formAction={deleteTestimonial}>Delete Testimonial</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
