import { TechnologyForm } from '../../TechnologyForm';
import { updateTechnologyAction } from '../../actions';
import { getAdminTechnologyById } from '@/server/services/technologyService';
import { notFound } from 'next/navigation';

export default async function EditTechnologyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tech = await getAdminTechnologyById(resolvedParams.id);

  if (!tech) {
    notFound();
  }

  const updateAction = updateTechnologyAction.bind(null, tech.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Technology</h1>
      <TechnologyForm action={updateAction} defaultValues={tech} />
    </div>
  );
}
