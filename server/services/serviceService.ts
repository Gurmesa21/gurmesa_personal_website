import { serviceRepository } from '../repositories/serviceRepository';
import { toPublicService, PublicServiceDTO } from '../../lib/dto/service';
import { Service, Prisma } from '@prisma/client';
import { auth } from '../../auth';

export async function getPublicServices(): Promise<PublicServiceDTO[]> {
  const services = await serviceRepository.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { order: 'asc' },
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

export async function createService(data: Omit<Prisma.ServiceCreateInput, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  await requireAdmin();
  return serviceRepository.create({ data });
}

export async function updateService(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
  await requireAdmin();
  return serviceRepository.update({
    where: { id },
    data,
  });
}

export async function deleteService(id: string): Promise<Service> {
  await requireAdmin();
  return serviceRepository.delete({
    where: { id },
  });
}
