import { ProjectForm, CaseStudyForm } from '../../ProjectForm';
import { updateProjectAction } from '../../actions';
import { getAdminProjectById } from '@/server/services/projectService';
import { notFound } from 'next/navigation';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getAdminProjectById(resolvedParams.id);

  if (!project) {
    notFound();
  }

  const updateAction = updateProjectAction.bind(null, project.id);

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
        <ProjectForm action={updateAction} defaultValues={project} />
      </div>

      <div>
        <CaseStudyForm projectId={project.id} defaultValues={project.caseStudy || undefined} />
      </div>
    </div>
  );
}
