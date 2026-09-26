import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const caseStudyRepository = {
  findMany: async (args?: Prisma.CaseStudyFindManyArgs) => prisma.caseStudy.findMany(args),
  findUnique: async (args: Prisma.CaseStudyFindUniqueArgs) => prisma.caseStudy.findUnique(args),
  create: async (args: Prisma.CaseStudyCreateArgs) => prisma.caseStudy.create(args),
  update: async (args: Prisma.CaseStudyUpdateArgs) => prisma.caseStudy.update(args),
  delete: async (args: Prisma.CaseStudyDeleteArgs) => prisma.caseStudy.delete(args),
};
