import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const testimonialRepository = {
  findMany: async (args?: Prisma.TestimonialFindManyArgs) => prisma.testimonial.findMany(args),
  findUnique: async (args: Prisma.TestimonialFindUniqueArgs) => prisma.testimonial.findUnique(args),
  create: async (args: Prisma.TestimonialCreateArgs) => prisma.testimonial.create(args),
  update: async (args: Prisma.TestimonialUpdateArgs) => prisma.testimonial.update(args),
  delete: async (args: Prisma.TestimonialDeleteArgs) => prisma.testimonial.delete(args),
};
