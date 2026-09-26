import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const skillRepository = {
  findMany: async (args?: Prisma.SkillFindManyArgs) => prisma.skill.findMany(args),
  findUnique: async (args: Prisma.SkillFindUniqueArgs) => prisma.skill.findUnique(args),
  create: async (args: Prisma.SkillCreateArgs) => prisma.skill.create(args),
  update: async (args: Prisma.SkillUpdateArgs) => prisma.skill.update(args),
  delete: async (args: Prisma.SkillDeleteArgs) => prisma.skill.delete(args),
};
