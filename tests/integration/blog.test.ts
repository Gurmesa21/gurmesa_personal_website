import { test, expect, vi } from 'vitest';
import { getPublicPosts, getPublicPostBySlug } from '../../server/services/blogService';
import { toPublicPost } from '../../lib/dto/blogPost';
import { prisma } from '../../server/repositories/db';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

test('Blog SEC-ACL tests', async () => {
  // 1. DRAFT post should be absent from getPublicPosts
  const draftPost = await prisma.blogPost.create({
    data: {
      title: 'Draft Post',
      slug: 'draft-post',
      excerpt: 'e',
      body: 'b',
      status: 'DRAFT'
    }
  });

  const publicPosts = await getPublicPosts();
  expect(publicPosts.map(p => p.slug)).not.toContain('draft-post');

  // 2. DRAFT post should return null from getPublicPostBySlug
  const post = await getPublicPostBySlug('draft-post');
  expect(post).toBeNull();

  // 3. allowlist mapper test
  const fullPost = {
    id: 'id1', slug: 'slug1', title: 't', excerpt: 'e', body: 'b', status: 'PUBLISHED',
    publishedAt: new Date(), updatedAt: new Date(),
    categoryId: 'c1', featuredImageId: 'f1', category: null, featuredImage: null, tags: []
  };
  const dto = toPublicPost(fullPost);
  expect(dto).not.toHaveProperty('categoryId');
  expect(dto).not.toHaveProperty('featuredImageId');

  await prisma.blogPost.delete({ where: { id: draftPost.id } });
});
