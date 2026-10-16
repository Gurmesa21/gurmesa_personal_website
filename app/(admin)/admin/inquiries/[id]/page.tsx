import { inquiryService } from '@/server/services/inquiryService';
import { InquiryStatus } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { DeleteInquiryForm } from './DeleteInquiryForm';

export const metadata = {
  title: 'Inquiry Detail - Admin',
  robots: { index: false, follow: false }
};

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const inquiry = await inquiryService.getInquiry(resolvedParams.id);
  
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inquiry Details</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/inquiries">
            &larr; Back to Inquiries
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Applicant Information</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Personal details and application.</p>
          </div>
          
          <form action={updateStatus} className="flex items-center gap-2">
            <select name="status" defaultValue={inquiry.status} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {Object.values(InquiryStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button type="submit">Update</Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full name</p>
              <p className="text-sm font-medium">{inquiry.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email address</p>
              <a href={`mailto:${inquiry.email}`} className="text-sm font-medium text-blue-600 hover:underline">{inquiry.email}</a>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization / Project Type</p>
              <p className="text-sm font-medium">{inquiry.organization || 'N/A'} / {inquiry.projectType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Source</p>
              <p className="text-sm font-medium">{inquiry.source || 'Direct'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notification Status</p>
              <p className="text-sm font-medium">
                {inquiry.notificationStatus} 
                {inquiry.notificationError && <span className="text-destructive ml-2">({inquiry.notificationError})</span>}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Message</p>
            <div className="mt-2 text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {inquiry.notes.map(note => (
              <div key={note.id} className="p-4 rounded-md bg-muted">
                <p className="text-sm whitespace-pre-wrap mb-2">{note.body}</p>
                <p className="text-xs text-muted-foreground">By {note.author.name} on {new Date(note.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {inquiry.notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
          </div>

          <form action={addNote} className="space-y-3">
            <Textarea 
              name="body" 
              rows={3} 
              required
              placeholder="Add a note..."
            />
            <Button type="submit">Add Note</Button>
          </form>
        </CardContent>
      </Card>

      <div className="pt-4">
        <DeleteInquiryForm action={deleteInquiry} />
      </div>

    </div>
  );
}
