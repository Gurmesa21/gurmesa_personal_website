import type { BlogPost, Category, Tag, MediaAsset } from '@prisma/client';

export type PublicBlogPost = Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'body' | 'status' | 'publishedAt' | 'updatedAt'> & {
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
  featuredImage: Pick<MediaAsset, 'id' | 'storageKey' | 'altText' | 'width' | 'height'> | null;
  tags: { tag: Pick<Tag, 'id' | 'name' | 'slug'> }[];
};

export function toPublicPost(post: any): PublicBlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    status: post.status,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    category: post.category ? {
      id: post.category.id,
      name: post.category.name,
      slug: post.category.slug,
    } : null,
    featuredImage: post.featuredImage ? {
      id: post.featuredImage.id,
      storageKey: post.featuredImage.storageKey,
      altText: post.featuredImage.altText,
      width: post.featuredImage.width,
      height: post.featuredImage.height,
    } : null,
    tags: (post.tags || []).map((t: any) => ({
      tag: {
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      }
    })),
  };
}
