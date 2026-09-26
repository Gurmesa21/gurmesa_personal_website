import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const inquiryRepository = {
  findMany: async (args?: Prisma.InquiryFindManyArgs) => prisma.inquiry.findMany(args),
  findUnique: async (args: Prisma.InquiryFindUniqueArgs) => prisma.inquiry.findUnique(args),
  create: async (args: Prisma.InquiryCreateArgs) => prisma.inquiry.create(args),
  update: async (args: Prisma.InquiryUpdateArgs) => prisma.inquiry.update(args),
  delete: async (args: Prisma.InquiryDeleteArgs) => prisma.inquiry.delete(args),
};
