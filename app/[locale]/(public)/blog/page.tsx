import { getPublicPosts } from '@/server/services/blogService';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { ContentCard } from '@/components/ui/ContentCard';
import { Search, BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogInteractionButtons } from '@/components/blog/BlogInteractionButtons';
import { formatReadingTime } from '@/lib/reading-time';
import { isTestMode } from '@/lib/test-mode';
import { unstable_noStore as noStore } from 'next/cache';

export const revalidate = 3600;
export const dynamic = 'auto';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'am' }, { locale: 'om' }];
}

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
  if (isTestMode()) {
    noStore();
  }
  const t = await getTranslations('Blog');
  const resolvedParams = await searchParams;
  const posts = await getPublicPosts({
    search: resolvedParams.title,
    category: resolvedParams.category,
    tag: resolvedParams.tag
  });

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
    const readTime = formatReadingTime(post.body || '');
    return { ...post, mediaObj, readTime };
  }));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 md:py-6">

        <div className="flex items-center justify-between pb-2 ">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#858EA8] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#292D45] bg-[#101426]">
              <BookOpen className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
              {t('title')}
            </span>
          </div>

          <h1 className="sr-only">
            {t('title')}
          </h1>
        </div>
        {/* Search field bar */}
        <div className="flex items-center justify-end mb-6 sm:mb-8 pb-6 border-b border-[#292D45]/60">
          {/* Search field and compact search action on right */}
          <form className="w-full md:w-80 lg:w-96 shrink-0 group ml-auto" method="GET">
            <div className="flex items-center w-full bg-[#101426] border border-[#292D45] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#8063F7]/40 focus-within:border-[#8063F7] transition-all">
              <div className="pl-3.5 pr-2 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-[#858EA8] group-focus-within:text-[#8063F7] transition-colors" />
              </div>
              <input
                name="title"
                defaultValue={resolvedParams.title}
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent border-none focus:outline-none text-[#F5F6FC] placeholder:text-[#858EA8] py-2 px-2 text-xs sm:text-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-none px-4 h-9.5 text-xs font-semibold bg-[#171D32] hover:bg-[#8063F7] text-[#F5F6FC] hover:text-white border-l border-[#292D45] transition-colors"
              >
                {t('searchButton')}
              </Button>
            </div>
          </form>
        </div>

        {/* Posts Grid: unified responsive 3-column layout, items-stretch */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 items-stretch">
          {postsWithImages.map((post) => (
            <ContentCard
              key={post.id}
              href={`/blog/${post.slug}`}
              media={post.mediaObj}
              fallbackIcon={BookOpen}
              title={post.title}
              description={post.excerpt}
              icon={
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#A5ABC1]">
                  <Calendar className="w-3.5 h-3.5 text-[#8063F7]" />
                  {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                </span>
              }
              badge={
                <div className="flex items-center gap-2">
                  {post.category && (
                    <span className="inline-block text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 border border-[#8063F7]/30 bg-[#8063F7]/15 text-[#A995FF] rounded-md backdrop-blur-sm">
                      {post.category.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 backdrop-blur-sm px-2 py-0.5 rounded-md bg-[#101426]/60 border border-[#292D45]/50 text-xs text-[#858EA8]">
                    <Clock className="w-3.5 h-3.5 text-[#858EA8]" />
                    {post.readTime}
                  </span>
                </div>
              }
              footerLeft={
                <BlogInteractionButtons
                  postId={post.id}
                  postSlug={post.slug}
                  initialLikesCount={post.likesCount || 0}
                  initialLikedByMe={post.likedByMe}
                />
              }
              footerCta={
                <span className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3.5 rounded-lg border border-[#8063F7]/40 bg-[#8063F7]/10 text-xs sm:text-sm font-semibold text-[#A995FF] group-hover:bg-[#8063F7] group-hover:text-white group-hover:border-[#8063F7] transition-all duration-200">
                  <span>{t('readArticle')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </span>
              }
            />
          ))}

          {posts.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#A5ABC1] border border-dashed border-[#292D45] rounded-2xl bg-[#101426]/50">
              <Search className="w-10 h-10 text-[#A5ABC1]/50 mx-auto mb-3" />
              <p className="text-base text-[#A5ABC1]">{t('noPosts')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}