import { Button } from '@/components/ui/button';
import { createAction } from '../actions';

export default function NewPage() {
  const item: any = null;
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-bold">Add Skill</h1>
      <form action={createAction} className="space-y-4">
        
      <div>
        <label className="block text-sm font-medium">name</label>
        <input name="name" defaultValue={item?.name || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">category</label>
        <input name="category" defaultValue={item?.category || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">proficiencyLabel</label>
        <input name="proficiencyLabel" defaultValue={item?.proficiencyLabel || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
