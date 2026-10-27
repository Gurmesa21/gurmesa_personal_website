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
    <div className="space-y-6 max-w-4xl min-w-0 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Inquiry Details</h1>
          <p className="text-sm text-muted-foreground mt-1">Review applicant message, manage status, and maintain notes.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/inquiries">
            &larr; Back to Inquiries
          </Link>
        </Button>
      </div>

      <Card className="bg-card border-border overflow-hidden min-w-0 max-w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <CardTitle>Applicant Information</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Personal details and application.</p>
          </div>
          
          <form action={updateStatus} className="flex items-center gap-2">
            <select
              name="status"
              defaultValue={inquiry.status}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {Object.values(InquiryStatus).map(s => (
                <option key={s} value={s} className="bg-[#101426] text-[#F5F6FC]">{s}</option>
              ))}
            </select>
            <Button type="submit">Update</Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 min-w-0 max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full name</p>
              <p className="text-sm font-medium text-foreground mt-1 break-words [overflow-wrap:anywhere]">{inquiry.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email address</p>
              <p className="mt-1">
                <a href={`mailto:${inquiry.email}`} className="text-sm font-medium text-primary hover:underline break-all">{inquiry.email}</a>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organization / Project Type</p>
              <p className="text-sm font-medium text-foreground mt-1 break-words [overflow-wrap:anywhere]">{inquiry.organization || 'N/A'} / {inquiry.projectType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</p>
              <p className="text-sm font-medium text-foreground mt-1 break-words [overflow-wrap:anywhere]">{inquiry.source || 'Direct'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notification Status</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {inquiry.notificationStatus} 
                {inquiry.notificationError && <span className="text-destructive ml-2">({inquiry.notificationError})</span>}
              </p>
            </div>
          </div>
          <div className="min-w-0 max-w-full pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Message</p>
            <div className="text-sm p-5 bg-muted/60 border border-border/60 rounded-xl whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full overflow-hidden leading-relaxed text-foreground">
              {inquiry.message}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border overflow-hidden min-w-0 max-w-full">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 min-w-0 max-w-full">
          <div className="space-y-4 min-w-0 max-w-full">
            {inquiry.notes.map(note => (
              <div key={note.id} className="p-4 rounded-xl bg-muted/60 border border-border/60 min-w-0 max-w-full">
                <p className="text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] mb-2 text-foreground leading-relaxed">{note.body}</p>
                <p className="text-xs text-muted-foreground">By {note.author.name} on {new Date(note.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {inquiry.notes.length === 0 && <p className="text-sm text-muted-foreground italic">No notes yet.</p>}
          </div>

          <form action={addNote} className="space-y-3 pt-2">
            <Textarea 
              name="body" 
              rows={3} 
              required
              placeholder="Add an internal note..."
              className="bg-card text-foreground"
            />
            <Button type="submit">Add Note</Button>
          </form>
        </CardContent>
      </Card>

      <div className="pt-2">
        <DeleteInquiryForm action={deleteInquiry} />
      </div>

    </div>
  );
}
