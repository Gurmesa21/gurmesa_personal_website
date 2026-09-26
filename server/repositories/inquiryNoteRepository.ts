import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const inquiryNoteRepository = {
  findMany: async (args?: Prisma.InquiryNoteFindManyArgs) => prisma.inquiryNote.findMany(args),
  findUnique: async (args: Prisma.InquiryNoteFindUniqueArgs) => prisma.inquiryNote.findUnique(args),
  create: async (args: Prisma.InquiryNoteCreateArgs) => prisma.inquiryNote.create(args),
  update: async (args: Prisma.InquiryNoteUpdateArgs) => prisma.inquiryNote.update(args),
  delete: async (args: Prisma.InquiryNoteDeleteArgs) => prisma.inquiryNote.delete(args),
};
