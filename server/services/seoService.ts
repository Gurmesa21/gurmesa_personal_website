import { prisma } from '../repositories/db';

export async function getSeoOverride(routeOrContentId: string) {
  return prisma.sEOOverride.findUnique({
    where: { routeOrContentId },
    include: { ogImage: true },
  });
}
