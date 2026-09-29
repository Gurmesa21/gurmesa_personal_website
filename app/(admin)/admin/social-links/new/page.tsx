import { Button } from '@/components/ui/button';
import { createAction } from '../actions';

export default function NewPage() {
  const item: any = null;
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-bold">Add SocialLink</h1>
      <form action={createAction} className="space-y-4">
        
      <div>
        <label className="block text-sm font-medium">platform</label>
        <input name="platform" defaultValue={item?.platform || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">url</label>
        <input name="url" defaultValue={item?.url || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">label</label>
        <input name="label" defaultValue={item?.label || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">visibility</label>
        <input name="visibility" defaultValue={item?.visibility || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
