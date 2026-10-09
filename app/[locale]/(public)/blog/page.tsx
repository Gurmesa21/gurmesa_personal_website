import Link from 'next/link';
import { getPublicPosts } from '@/server/services/blogService';
import { getSeoOverride } from '@/server/services/seoService';
import { getPublicProfile } from '@/server/services/profileService';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { User, Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogInteractionButtons } from '@/components/blog/BlogInteractionButtons';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const override = await getSeoOverride('/blog');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || 'Blog',
    description: override?.description || 'My articles.',
    alternates: { canonical: override?.canonical || `${siteUrl}/blog` },
    openGraph: {
      title: override?.title || 'Blog',
      url: `${siteUrl}/blog`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<{ title?: string, category?: string, tag?: string }> }) {
  const t = await getTranslations('Blog');
  const resolvedParams = await searchParams;
  const posts = await getPublicPosts({
    search: resolvedParams.title,
    category: resolvedParams.category,
    tag: resolvedParams.tag
  });

  const profile = await getPublicProfile();
  const avatarUrl = profile?.avatarUrl || null;
  const storage = getStorageAdapter();

  const postsWithImages = await Promise.all(posts.map(async post => {
    let mediaObj = null;
    if (post.featuredImage?.storageKey) {
      mediaObj = {
        url: await storage.getUrl(post.featuredImage.storageKey),
        mimeType: post.featuredImage.mimeType,
        altText: post.featuredImage.altText
      };
    }
    const readTime = Math.max(1, Math.ceil((post.body?.length || 500) / 1000)) + " min read";
    return { ...post, mediaObj, readTime };
  }));

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Insights, tutorials, and stories about web development and design.
        </p>
      </div>

      <form className="mb-12 max-w-xl mx-auto group" method="GET">
        <div className="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-sm hover:shadow-md">
          <div className="pl-5 pr-2 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            name="title"
            defaultValue={resolvedParams.title}
            placeholder={t('searchPlaceholder')}
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 py-3.5 px-2 text-base"
          />
          <Button
            type="submit"
            className="rounded-none px-8 h-full min-h-[52px] text-base font-semibold"
          >
            {t('searchButton')}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-12">
        {postsWithImages.map(post => (
          <article key={post.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group">

            {/* Header: Author & Meta */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-slate-50 relative shrink-0">
                  {avatarUrl ? (
                    <MediaRenderer url={avatarUrl} mimeType="image/jpeg" altText={profile?.name || 'Author'} fill className="object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{profile?.name || 'Admin'}</div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Media: Social Feed Style (Full width) */}
            {post.mediaObj && (
              <Link href={`/blog/${post.slug}`} className="block relative w-full aspect-[21/9] sm:aspect-[2/1] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <MediaRenderer url={post.mediaObj.url} mimeType={post.mediaObj.mimeType} altText={post.mediaObj.altText || post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </Link>
            )}

            {/* Content: Title & Excerpt */}
            <div className="p-6 md:p-8 flex flex-col gap-4">
              {post.category && (
                <div className="flex items-center">
                  <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {post.category.name}
                  </span>
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 dark:text-slate-50 group-hover:text-primary transition-colors duration-300 leading-tight">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                {post.excerpt}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <BlogInteractionButtons
                postId={post.id}
                postSlug={post.slug}
                initialLikesCount={post.likesCount || 0}
                initialLikedByMe={post.likedByMe}
              />
              <Button variant="ghost" size="sm" asChild className="rounded-full group/btn">
                <Link href={`/blog/${post.slug}`}>
                  {t('readArticle')} <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

          </article>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-500">{t('noPosts')}</p>
          </div>
        )}
      </div>
    </div>
  );
}