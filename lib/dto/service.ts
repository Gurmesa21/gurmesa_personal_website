import { Service } from '@prisma/client';

export type PublicServiceDTO = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  deliverables: string[];
  startingPriceRange: string | null;
  featuredImageId: string | null;
  order: number;
};

export function toPublicService(service: Service): PublicServiceDTO {
  return {
    id: service.id,
    slug: service.slug,
    title: service.title,
    summary: service.summary,
    description: service.description,
    deliverables: service.deliverables,
    startingPriceRange: service.startingPriceRange,
    featuredImageId: service.featuredImageId,
    order: service.order,
  };
}
