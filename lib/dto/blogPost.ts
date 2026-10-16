import type { BlogPost, Category, Tag, MediaAsset, BlogComment } from '@prisma/client';

export type PublicBlogPost = Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'body' | 'status' | 'publishedAt' | 'updatedAt'> & {
  likesCount: number;
  likedByMe?: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
  featuredImage: Pick<MediaAsset, 'id' | 'storageKey' | 'altText' | 'width' | 'height' | 'mimeType'> | null;
  tags: { tag: Pick<Tag, 'id' | 'name' | 'slug'> }[];
  comments?: Pick<BlogComment, 'id' | 'author' | 'content' | 'createdAt'>[];
};

type FullBlogPost = BlogPost & {
  _count?: { likes: number };
  likedByMe?: boolean;
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  featuredImage?: Pick<MediaAsset, 'id' | 'storageKey' | 'altText' | 'width' | 'height' | 'mimeType'> | null;
  tags?: { tag: Pick<Tag, 'id' | 'name' | 'slug'> }[];
  comments?: BlogComment[];
};

export function toPublicPost(post: FullBlogPost): PublicBlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    status: post.status,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    likesCount: post._count?.likes ?? 0,
    likedByMe: post.likedByMe,
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
      mimeType: post.featuredImage.mimeType,
    } : null,
    tags: (post.tags || []).map((t) => ({
      tag: {
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      }
    })),
    comments: (post.comments || []).map((c) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt,
    })),
  };
}
