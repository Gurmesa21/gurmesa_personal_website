import { ProjectForm } from '../ProjectForm';
import { createProjectAction } from '../actions';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Project</h1>
      <ProjectForm action={createProjectAction} />
    </div>
  );
}
