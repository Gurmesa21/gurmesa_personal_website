import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const blogPostRepository = {
  findMany: async (args?: Prisma.BlogPostFindManyArgs) => prisma.blogPost.findMany(args),
  findUnique: async (args: Prisma.BlogPostFindUniqueArgs) => prisma.blogPost.findUnique(args),
  create: async (args: Prisma.BlogPostCreateArgs) => prisma.blogPost.create(args),
  update: async (args: Prisma.BlogPostUpdateArgs) => prisma.blogPost.update(args),
  delete: async (args: Prisma.BlogPostDeleteArgs) => prisma.blogPost.delete(args),
};
