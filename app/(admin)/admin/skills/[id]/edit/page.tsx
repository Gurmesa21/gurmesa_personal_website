import { Button } from '@/components/ui/button';
import { updateAction } from '../../actions';
import { skillRepository } from '@/server/repositories/skillRepository';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = await skillRepository.findUnique({ where: { id: resolvedParams.id } });
  if (!item) return <div>Not found</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-bold">Edit Skill</h1>
      <form action={updateAction.bind(null, item.id)} className="space-y-4">
        
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
