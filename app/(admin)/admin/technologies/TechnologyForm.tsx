import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Technology } from '@prisma/client';

export function TechnologyForm({ action, defaultValues = {} }: { action: (formData: FormData) => void; defaultValues?: Partial<Technology> }) {
  return (
    <form action={action} className="space-y-6 max-w-2xl bg-card border p-6 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={defaultValues.name} required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue={defaultValues.category} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={defaultValues.slug} required />
      </div>

      <div className="flex gap-4">
        <Button type="submit">Save Technology</Button>
        <Button variant="outline" asChild>
          <Link href="/admin/technologies">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
