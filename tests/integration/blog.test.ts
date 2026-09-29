import { describe, test, expect, vi } from 'vitest';
import { getPublicPosts, getPublicPostBySlug } from '../../server/services/blogService';
import { toPublicPost } from '../../lib/dto/blogPost';
import { prisma } from '../../server/repositories/db';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

describe('Blog SEC-ACL tests', () => {
  test('getPublicPosts() excludes DRAFT posts', async () => {
    const draftPost = await prisma.blogPost.create({
      data: { title: 'Draft Post', slug: 'draft-post-test', excerpt: 'e', body: 'b', status: 'DRAFT' }
    });
    const publicPosts = await getPublicPosts();
    expect(publicPosts.map(p => p.slug)).not.toContain('draft-post-test');
    await prisma.blogPost.delete({ where: { id: draftPost.id } });
  });

  test('getPublicPosts() excludes ARCHIVED posts', async () => {
    const archivedPost = await prisma.blogPost.create({
      data: { title: 'Archived Post', slug: 'archived-post-test', excerpt: 'e', body: 'b', status: 'ARCHIVED' }
    });
    const publicPosts = await getPublicPosts();
    expect(publicPosts.map(p => p.slug)).not.toContain('archived-post-test');
    await prisma.blogPost.delete({ where: { id: archivedPost.id } });
  });

  test('getPublicPostBySlug(slug) returns null for a DRAFT post\'s real slug', async () => {
    const draftPost = await prisma.blogPost.create({
      data: { title: 'Draft Post 2', slug: 'draft-post-test-2', excerpt: 'e', body: 'b', status: 'DRAFT' }
    });
    const post = await getPublicPostBySlug('draft-post-test-2');
    expect(post).toBeNull();
    await prisma.blogPost.delete({ where: { id: draftPost.id } });
  });

  test('getPublicPostBySlug(slug) returns null for an ARCHIVED post', async () => {
    const archivedPost = await prisma.blogPost.create({
      data: { title: 'Archived Post 2', slug: 'archived-post-test-2', excerpt: 'e', body: 'b', status: 'ARCHIVED' }
    });
    const post = await getPublicPostBySlug('archived-post-test-2');
    expect(post).toBeNull();
    await prisma.blogPost.delete({ where: { id: archivedPost.id } });
  });

  test('toPublicPost() output keys match the declared allowlist exactly', () => {
    const fullPost = {
      id: 'id1', slug: 'slug1', title: 't', excerpt: 'e', body: 'b', status: 'PUBLISHED' as const,
      publishedAt: new Date(), updatedAt: new Date(),
      categoryId: 'c1', featuredImageId: 'f1', category: null, featuredImage: null, tags: []
    };
    const dto = toPublicPost(fullPost as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);
    expect(Object.keys(dto).sort()).toEqual(['body', 'category', 'excerpt', 'featuredImage', 'id', 'publishedAt', 'slug', 'status', 'tags', 'title', 'updatedAt'].sort());
  });

  test('unauthenticated: createPost rejected', async () => {
    const { createPost } = await import('../../server/services/blogService');
    await expect(createPost({ title: 'x', slug: 'x', excerpt: 'x', body: 'x', status: 'DRAFT' })).rejects.toThrow('Unauthorized');
  });

  test('unauthenticated: updatePost rejected', async () => {
    const { updatePost } = await import('../../server/services/blogService');
    await expect(updatePost('some-id', { title: 'x' })).rejects.toThrow('Unauthorized');
  });

  test('unauthenticated: publish rejected', async () => {
    // There's no specific publish method in service, publishing is just updatePost with status PUBLISHED
    const { updatePost } = await import('../../server/services/blogService');
    await expect(updatePost('some-id', { status: 'PUBLISHED' })).rejects.toThrow('Unauthorized');
  });

  test('unauthenticated: deletePost rejected', async () => {
    const { deletePost } = await import('../../server/services/blogService');
    await expect(deletePost('some-id')).rejects.toThrow('Unauthorized');
  });

  test('unauthenticated: category create rejected', async () => {
    const { createCategoryAction } = await import('../../app/(admin)/admin/blog/actions');
    const formData = new FormData();
    formData.append('name', 'C');
    formData.append('slug', 'c');
    await expect(createCategoryAction(formData)).rejects.toThrow('Unauthorized');
  });

  test('unauthenticated: category delete rejected', async () => {
    const { deleteCategoryAction } = await import('../../app/(admin)/admin/blog/actions');
    await expect(deleteCategoryAction('id')).rejects.toThrow('Unauthorized');
  });

  test('unauthenticated: tag create rejected', async () => {
    const { createTagAction } = await import('../../app/(admin)/admin/blog/actions');
    const formData = new FormData();
    formData.append('name', 'T');
    formData.append('slug', 't');
    await expect(createTagAction(formData)).rejects.toThrow('Unauthorized');
  });

  test('unauthenticated: tag delete rejected', async () => {
    const { deleteTagAction } = await import('../../app/(admin)/admin/blog/actions');
    await expect(deleteTagAction('id')).rejects.toThrow('Unauthorized');
  });
});
