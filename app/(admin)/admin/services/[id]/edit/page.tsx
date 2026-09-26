import { ServiceForm } from '@/app/(admin)/admin/services/ServiceForm';
import { updateServiceAction } from '@/app/(admin)/admin/services/actions';
import { getAdminServiceById } from '@/server/services/serviceService';
import { notFound, redirect } from 'next/navigation';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const service = await getAdminServiceById(resolvedParams.id);

  if (!service) {
    notFound();
  }

  const action = async (formData: FormData) => {
    'use server';
    await updateServiceAction(resolvedParams.id, formData);
    redirect('/admin/services');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Service</h1>
      <ServiceForm action={action} defaultValues={service} />
    </div>
  );
}
