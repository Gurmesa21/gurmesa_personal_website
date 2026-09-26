import { ServiceForm } from '../ServiceForm';
import { createServiceAction } from '../actions';
import { redirect } from 'next/navigation';

export default function NewServicePage() {
  const action = async (formData: FormData) => {
    'use server';
    await createServiceAction(formData);
    redirect('/admin/services');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Service</h1>
      <ServiceForm action={action} />
    </div>
  );
}
