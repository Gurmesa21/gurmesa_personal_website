import { inquiryService } from '@/server/services/inquiryService';
import { InquiryStatus } from '@prisma/client';
import Link from 'next/link';

export const metadata = {
  title: 'Inquiries - Admin',
  robots: { index: false, follow: false }
};

export default async function InquiriesPage({
  searchParams
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const q = searchParams.q || '';
  const statusParam = searchParams.status as InquiryStatus | undefined;
  const page = parseInt(searchParams.page || '1', 10);

  const { items, total } = await inquiryService.listInquiries({
    search: q,
    status: statusParam,
    page,
    limit: 20
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inquiries</h1>
        <Link href="/admin" className="text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <form method="get" className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search name or email..."
            className="border p-2 rounded"
          />
          <select name="status" defaultValue={statusParam || ''} className="border p-2 rounded">
            <option value="">All Statuses</option>
            {Object.values(InquiryStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(inq => (
              <tr key={inq.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inq.name} <br/>
                  <span className="text-gray-500">{inq.email}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {inq.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/admin/inquiries/${inq.id}`} className="text-blue-600 hover:text-blue-900">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No inquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Showing {items.length} of {total} inquiries
      </div>
    </div>
  );
}
