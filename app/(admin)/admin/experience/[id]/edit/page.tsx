import { Button } from '@/components/ui/button';
import { updateAction } from '../../actions';
import { experienceRepository } from '@/server/repositories/experienceRepository';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = await experienceRepository.findUnique({ where: { id: resolvedParams.id } });
  if (!item) return <div>Not found</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-bold">Edit Experience</h1>
      <form action={updateAction.bind(null, item.id)} className="space-y-4">
        
      <div>
        <label className="block text-sm font-medium">organization</label>
        <input name="organization" defaultValue={item?.organization || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">role</label>
        <input name="role" defaultValue={item?.role || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">startDate</label>
        <input name="startDate" defaultValue={item?.startDate?.toISOString().slice(0,10) || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">endDate</label>
        <input name="endDate" defaultValue={item?.endDate?.toISOString().slice(0,10) || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">description</label>
        <input name="description" defaultValue={item?.description || ''} className="mt-1 block w-full rounded-md border p-2" />
      </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
