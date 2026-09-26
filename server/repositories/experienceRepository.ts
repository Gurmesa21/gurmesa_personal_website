import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const experienceRepository = {
  findMany: async (args?: Prisma.ExperienceFindManyArgs) => prisma.experience.findMany(args),
  findUnique: async (args: Prisma.ExperienceFindUniqueArgs) => prisma.experience.findUnique(args),
  create: async (args: Prisma.ExperienceCreateArgs) => prisma.experience.create(args),
  update: async (args: Prisma.ExperienceUpdateArgs) => prisma.experience.update(args),
  delete: async (args: Prisma.ExperienceDeleteArgs) => prisma.experience.delete(args),
};
