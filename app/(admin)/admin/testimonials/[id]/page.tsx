import { testimonialService } from '@/server/services/testimonialService';
import { TestimonialStatus, TestimonialPermissionStatus } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

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
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Testimonial</h1>
        <Link href="/admin/testimonials" className="text-blue-600 hover:underline">
          &larr; Back
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">{t.name}</h2>
          <p className="text-sm text-gray-500">{t.role} {t.organization ? `at ${t.organization}` : ''}</p>
          <blockquote className="mt-4 p-4 italic border-l-4 bg-gray-50 text-gray-700">
            &quot;{t.content}&quot;
          </blockquote>
        </div>

        <form action={updateTestimonial} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" defaultValue={t.status} className="w-full border p-2 rounded">
                {Object.values(TestimonialStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
              <select name="permissionStatus" defaultValue={t.permissionStatus} className="w-full border p-2 rounded">
                {Object.values(TestimonialPermissionStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={t.featured} className="rounded" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isAnonymous" defaultChecked={t.isAnonymous} className="rounded" />
              <span className="text-sm">Anonymous (hides name/org)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200 mt-6">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="border-t pt-6">
        <form action={deleteTestimonial}>
          <button type="submit" className="text-red-600 hover:text-red-800 font-medium text-sm">
            Delete Testimonial
          </button>
        </form>
      </div>
    </div>
  );
}
