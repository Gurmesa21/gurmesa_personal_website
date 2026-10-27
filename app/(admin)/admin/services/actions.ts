'use server';

import { revalidatePublicContent } from '@/lib/revalidate';
import { revalidatePath } from 'next/cache';
import { createService, updateService, deleteService } from '../../../../server/services/serviceService';
import { ServiceStatus } from '@prisma/client';

export async function createServiceAction(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const summary = formData.get('summary') as string;
  const description = formData.get('description') as string;
  const startingPriceRange = formData.get('startingPriceRange') as string;
  const status = formData.get('status') as ServiceStatus || 'DRAFT';
  const featuredImageId = formData.get('featuredImageId') as string;
  
  const deliverablesRaw = formData.get('deliverables') as string;
  const deliverables = deliverablesRaw ? deliverablesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  await createService({
    title,
    slug,
    summary,
    description,
    deliverables,
    startingPriceRange: startingPriceRange || null,
    status,
    featuredImageId: featuredImageId || null,
    order: 999, // default last
  });

  revalidatePath('/admin/services');
  revalidatePublicContent({ paths: ['/services', `/services/${slug}`] });
}

export async function updateServiceAction(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const summary = formData.get('summary') as string;
  const description = formData.get('description') as string;
  const startingPriceRange = formData.get('startingPriceRange') as string;
  const status = formData.get('status') as ServiceStatus;
  const featuredImageId = formData.get('featuredImageId') as string;
  
  const deliverablesRaw = formData.get('deliverables') as string;
  const deliverables = deliverablesRaw ? deliverablesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  await updateService(id, {
    title,
    slug,
    summary,
    description,
    deliverables,
    startingPriceRange: startingPriceRange || null,
    status,
    featuredImageId: featuredImageId || null,
  });

  revalidatePath('/admin/services');
  revalidatePublicContent({ paths: ['/services', `/services/${slug}`] });
}

export async function deleteServiceAction(id: string) {
  await deleteService(id);
  revalidatePath('/admin/services');
  revalidatePublicContent({ paths: ['/services'] });
}

export async function togglePublishAction(id: string, currentStatus: ServiceStatus) {
  const newStatus: ServiceStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  await updateService(id, { status: newStatus });
  revalidatePath('/admin/services');
  revalidatePublicContent({ paths: ['/services'] });
}

export async function moveServiceAction(id: string, newOrder: number) {
  await updateService(id, { order: newOrder });
  revalidatePath('/admin/services');
  revalidatePublicContent({ paths: ['/services'] });
}
