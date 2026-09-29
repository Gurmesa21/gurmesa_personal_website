import { inquiryService } from '@/server/services/inquiryService';
import { InquiryStatus } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Inquiry Detail - Admin',
  robots: { index: false, follow: false }
};

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const inquiry = await inquiryService.getInquiry(params.id);
  
  if (!inquiry) {
    notFound();
  }

  async function updateStatus(formData: FormData) {
    'use server';
    const newStatus = formData.get('status') as InquiryStatus;
    if (newStatus) {
      await inquiryService.updateStatus(inquiry!.id, newStatus);
      revalidatePath(`/admin/inquiries/${inquiry!.id}`);
    }
  }

  async function addNote(formData: FormData) {
    'use server';
    const body = formData.get('body') as string;
    if (body?.trim()) {
      await inquiryService.addNote(inquiry!.id, body.trim());
      revalidatePath(`/admin/inquiries/${inquiry!.id}`);
    }
  }

  async function deleteInquiry() {
    'use server';
    await inquiryService.deleteInquiry(inquiry!.id);
    redirect('/admin/inquiries');
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inquiry Details</h1>
        <Link href="/admin/inquiries" className="text-blue-600 hover:underline">
          &larr; Back to Inquiries
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Applicant Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
          </div>
          
          <form action={updateStatus} className="flex items-center gap-2">
            <select name="status" defaultValue={inquiry.status} className="border p-2 rounded text-sm">
              {Object.values(InquiryStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Update</button>
          </form>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{inquiry.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">{inquiry.email}</a>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Organization / Project Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inquiry.organization || 'N/A'} / {inquiry.projectType || 'N/A'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Source</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{inquiry.source || 'Direct'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notification Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {inquiry.notificationStatus} 
                {inquiry.notificationError && <span className="text-red-500 ml-2">({inquiry.notificationError})</span>}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Message</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                {inquiry.message}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Notes</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <ul className="space-y-4 mb-6">
            {inquiry.notes.map(note => (
              <li key={note.id} className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-900 whitespace-pre-wrap mb-2">{note.body}</p>
                <p className="text-xs text-gray-500">By {note.author.name} on {new Date(note.createdAt).toLocaleString()}</p>
              </li>
            ))}
            {inquiry.notes.length === 0 && <p className="text-sm text-gray-500">No notes yet.</p>}
          </ul>

          <form action={addNote} className="space-y-3">
            <textarea 
              name="body" 
              rows={3} 
              required
              placeholder="Add a note..."
              className="w-full border p-2 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded text-sm">Add Note</button>
          </form>
        </div>
      </div>

      <div className="border-t pt-6">
        <form action={deleteInquiry} onSubmit={(e) => {
          if(!confirm('Are you sure you want to delete this inquiry?')) e.preventDefault();
        }}>
          <button type="submit" className="text-red-600 hover:text-red-800 font-medium text-sm">
            Delete Inquiry
          </button>
        </form>
      </div>

    </div>
  );
}
