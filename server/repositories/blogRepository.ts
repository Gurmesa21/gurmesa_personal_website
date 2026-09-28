import { prisma } from './db';
import type { Prisma } from '@prisma/client';

export const blogRepository = {
  findMany: async (args?: Prisma.BlogPostFindManyArgs) => prisma.blogPost.findMany(args),
  findFirst: async (args: Prisma.BlogPostFindFirstArgs) => prisma.blogPost.findFirst(args),
  create: async (args: Prisma.BlogPostCreateArgs) => prisma.blogPost.create(args),
  update: async (args: Prisma.BlogPostUpdateArgs) => prisma.blogPost.update(args),
  delete: async (args: Prisma.BlogPostDeleteArgs) => prisma.blogPost.delete(args),

  // Categories
  findManyCategories: async () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
  createCategory: async (args: Prisma.CategoryCreateArgs) => prisma.category.create(args),
  updateCategory: async (args: Prisma.CategoryUpdateArgs) => prisma.category.update(args),
  deleteCategory: async (args: Prisma.CategoryDeleteArgs) => prisma.category.delete(args),

  // Tags
  findManyTags: async () => prisma.tag.findMany({ orderBy: { name: 'asc' } }),
  createTag: async (args: Prisma.TagCreateArgs) => prisma.tag.create(args),
  updateTag: async (args: Prisma.TagUpdateArgs) => prisma.tag.update(args),
  deleteTag: async (args: Prisma.TagDeleteArgs) => prisma.tag.delete(args),
};
