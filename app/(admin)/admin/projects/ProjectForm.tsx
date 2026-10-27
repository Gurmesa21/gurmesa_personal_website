'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Project, CaseStudy, ProjectMedia } from '@prisma/client';
import { upsertCaseStudyAction } from './actions';
import { MediaPicker } from '@/components/admin/MediaPicker';

import { useState } from 'react';

export function ProjectForm({ action, defaultValues = {} }: { action: (formData: FormData) => void; defaultValues?: Partial<Project> & { media?: ProjectMedia[] } }) {
  const featuredMedia = defaultValues.media?.find(m => m.order === 0);
  const [featuredMediaId, setFeaturedMediaId] = useState(featuredMedia?.mediaId || '');
  return (
    <form action={action} className="space-y-6 max-w-2xl bg-card border p-6 rounded-lg">
      <div className="space-y-2">
        <Label>Featured Image</Label>
        <MediaPicker name="featuredMediaId" value={featuredMediaId} onChange={setFeaturedMediaId} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaultValues.title} required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={defaultValues.slug} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="liveUrl">Live Project URL</Label>
        <Input
          id="liveUrl"
          name="liveUrl"
          type="url"
          placeholder="https://example.com"
          defaultValue={defaultValues.liveUrl || ''}
        />
        <p className="text-xs text-muted-foreground">Optional link to the deployed/live project website.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" rows={3} defaultValue={defaultValues.summary} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Project Status</Label>
          <select id="status" name="status" defaultValue={defaultValues.status || 'INQUIRY'} className="flex h-10 w-full rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm ring-offset-background">
            <option value="INQUIRY" className="bg-[#101426] text-[#F5F6FC]">Inquiry</option>
            <option value="ACTIVE" className="bg-[#101426] text-[#F5F6FC]">Active</option>
            <option value="DELIVERED" className="bg-[#101426] text-[#F5F6FC]">Delivered</option>
            <option value="ARCHIVED" className="bg-[#101426] text-[#F5F6FC]">Archived</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confidentiality">Confidentiality</Label>
          <select id="confidentiality" name="confidentiality" defaultValue={defaultValues.confidentiality || 'PRIVATE'} className="flex h-10 w-full rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm ring-offset-background">
            <option value="PUBLIC" className="bg-[#101426] text-[#F5F6FC]">Public</option>
            <option value="ANONYMIZED" className="bg-[#101426] text-[#F5F6FC]">Anonymized</option>
            <option value="PRIVATE" className="bg-[#101426] text-[#F5F6FC]">Private</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientRef">Client Reference (Private)</Label>
        <Input id="clientRef" name="clientRef" defaultValue={defaultValues.clientRef || ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internalNotes">Internal Notes (Private)</Label>
        <Textarea id="internalNotes" name="internalNotes" defaultValue={defaultValues.internalNotes || ''} />
      </div>

      <div className="flex gap-4">
        <Button type="submit">Save Project</Button>
        <Button variant="outline" asChild>
          <Link href="/admin/projects">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

export function CaseStudyForm({ projectId, defaultValues = {} }: { projectId: string; defaultValues?: Partial<CaseStudy> }) {
  const action = upsertCaseStudyAction.bind(null, projectId);
  return (
    <form action={action} className="space-y-6 max-w-2xl bg-card border p-6 rounded-lg mt-8 border-primary">
      <h2 className="text-2xl font-bold">Case Study</h2>
      <div className="space-y-2">
        <Label htmlFor="problem">Problem</Label>
        <Textarea id="problem" name="problem" defaultValue={defaultValues.problem} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="solution">Solution</Label>
        <Textarea id="solution" name="solution" defaultValue={defaultValues.solution} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input id="role" name="role" defaultValue={defaultValues.role} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scope">Scope</Label>
        <Input id="scope" name="scope" defaultValue={defaultValues.scope} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="architectureSummary">Architecture Summary</Label>
        <Textarea id="architectureSummary" name="architectureSummary" defaultValue={defaultValues.architectureSummary} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="keyDecisions">Key Decisions</Label>
        <Textarea id="keyDecisions" name="keyDecisions" defaultValue={defaultValues.keyDecisions || ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="challenges">Challenges</Label>
        <Textarea id="challenges" name="challenges" defaultValue={defaultValues.challenges || ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="outcome">Outcome</Label>
        <Textarea id="outcome" name="outcome" defaultValue={defaultValues.outcome} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Full Content / Body</Label>
        <Textarea id="content" name="content" defaultValue={defaultValues.content} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Case Study Status</Label>
        <select id="status" name="status" defaultValue={defaultValues.status || 'DRAFT'} className="flex h-10 w-full rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm ring-offset-background">
          <option value="DRAFT" className="bg-[#101426] text-[#F5F6FC]">Draft</option>
          <option value="PUBLISHED" className="bg-[#101426] text-[#F5F6FC]">Published</option>
        </select>
      </div>

      <Button type="submit">Save Case Study</Button>
    </form>
  );
}
