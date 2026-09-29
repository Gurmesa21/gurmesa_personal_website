import { testimonialService } from '@/server/services/testimonialService';

import Link from 'next/link';

export const metadata = {
  title: 'Testimonials - Admin',
  robots: { index: false, follow: false }
};

export default async function TestimonialsPage() {
  const testimonials = await testimonialService.listAdminTestimonials();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Link href="/admin" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anonymous</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testimonials.map(t => (
              <tr key={t.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {t.name} <br/>
                  <span className="text-gray-500">{t.role || 'No role'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {t.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {t.permissionStatus}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {t.isAnonymous ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/testimonials/${t.id}`} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No testimonials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
