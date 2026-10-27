import { serviceRepository } from '../repositories/serviceRepository';
import { toPublicService, PublicServiceDTO } from '../../lib/dto/service';
import { Service, Prisma } from '@prisma/client';
import { auth } from '../../auth';
import { logAdminAction } from '@/lib/audit';

export async function getPublicServices(options?: { limit?: number; orderBy?: 'createdAt' | 'order' }): Promise<PublicServiceDTO[]> {
  const orderBy = options?.orderBy === 'createdAt'
    ? { createdAt: 'desc' as const }
    : { order: 'asc' as const };

  const services = await serviceRepository.findMany({
    where: { status: 'PUBLISHED' },
    orderBy,
    take: options?.limit,
  });
  return services.map(toPublicService);
}

export async function getPublicServiceBySlug(slug: string): Promise<PublicServiceDTO | null> {
  const service = await serviceRepository.findUnique({
    where: { slug, status: 'PUBLISHED' },
  });
  if (!service) return null;
  return toPublicService(service);
}

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
}

export async function getAdminServices(): Promise<Service[]> {
  await requireAdmin();
  return serviceRepository.findMany({
    orderBy: { order: 'asc' },
  });
}

export async function getAdminServiceById(id: string): Promise<Service | null> {
  await requireAdmin();
  return serviceRepository.findUnique({
    where: { id },
  });
}

export async function createService(data: Omit<Prisma.ServiceUncheckedCreateInput, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  await requireAdmin();
  const result = await serviceRepository.create({ data });
  await logAdminAction({ action: 'CREATE', entity: 'Service', entityId: result?.id || 'unknown' });
  return result;
}

export async function updateService(id: string, data: Prisma.ServiceUncheckedUpdateInput): Promise<Service> {
  await requireAdmin();
  const result = await serviceRepository.update({
    where: { id },
    data,
  });
  await logAdminAction({ action: 'UPDATE', entity: 'Service', entityId: result?.id || 'unknown' });
  return result;
}

export async function deleteService(id: string): Promise<Service> {
  await requireAdmin();
  const result = await serviceRepository.delete({
    where: { id },
  });
  await logAdminAction({ action: 'DELETE', entity: 'Service', entityId: result?.id || 'unknown' });
  return result;
}
