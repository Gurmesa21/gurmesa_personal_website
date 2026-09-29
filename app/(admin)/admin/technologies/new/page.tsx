import { TechnologyForm } from '../TechnologyForm';
import { createTechnologyAction } from '../actions';

export default function NewTechnologyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Technology</h1>
      <TechnologyForm action={createTechnologyAction} />
    </div>
  );
}
