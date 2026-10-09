import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { MediaPicker } from '@/components/admin/MediaPicker';

import { Service } from '@prisma/client';

export function ServiceForm({ action, defaultValues = {} }: { action: (formData: FormData) => void; defaultValues?: Partial<Service> }) {
  return (
    <form action={action} className="space-y-6 max-w-2xl bg-card border p-6 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaultValues.title} required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={defaultValues.slug} required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Input id="summary" name="summary" defaultValue={defaultValues.summary} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={defaultValues.description} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliverables">Deliverables (comma separated)</Label>
        <Input id="deliverables" name="deliverables" defaultValue={defaultValues.deliverables?.join(', ')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startingPriceRange">Starting Price Range</Label>
        <Input id="startingPriceRange" name="startingPriceRange" defaultValue={defaultValues.startingPriceRange || ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={defaultValues.status || 'DRAFT'} className="flex w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Featured Image</Label>
        <MediaPicker name="featuredImageId" defaultValue={defaultValues.featuredImageId || ''} />
      </div>

      <div className="flex gap-4">
        <Button type="submit">Save Service</Button>
        <Button variant="outline" asChild>
          <Link href="/admin/services">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
