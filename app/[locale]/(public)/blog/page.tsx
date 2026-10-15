import Link from 'next/link';
import { getPublicPosts } from '@/server/services/blogService';
import { getSeoOverride } from '@/server/services/seoService';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStorageAdapter } from '@/lib/storage';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Horizontal Editorial Header on Desktop, stacked on Mobile */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 sm:gap-6 mb-6 sm:mb-8 pb-6 border-b border-[#292D45]/60">
          {/* Title and description on left */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">

              <span className="inline-flex items-center gap-2 rounded-full border border-[#292D45] bg-[#171D32] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />

                {t('title')}
              </span>
            </div>


          </div>

          {/* Search field and compact search action on right */}
          <form className="w-full md:w-80 lg:w-96 shrink-0 group" method="GET">
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

        {/* Posts Grid: 2 balanced columns desktop, 1 column mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {postsWithImages.map(post => (
            <article
              key={post.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 overflow-hidden min-h-[240px] sm:min-h-[260px]"
            >
              {/* Thin Top Accent Line Animation */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

              {/* Static Background Media Layer: covers entire card behind text */}
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                {post.mediaObj ? (
                  post.mediaObj.mimeType.startsWith('video/') ? (
                    <video
                      src={post.mediaObj.url}
                      className="h-full w-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <MediaRenderer
                      url={post.mediaObj.url}
                      mimeType={post.mediaObj.mimeType}
                      altText={post.mediaObj.altText || post.title}
                      fill
                      className="object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )
                ) : (
                  <div className="relative h-full w-full bg-gradient-to-br from-[#4F6FF0]/25 via-[#171D32] to-[#101426]">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#8063F7]/20 to-transparent" />
                  </div>
                )}
                {/* Gradient overlay: increased transparency so background image is clearly visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B16]/92 via-[#080B16]/55 to-[#080B16]/35 group-hover:via-[#080B16]/45 group-hover:to-[#080B16]/25 transition-all duration-300" />
              </div>

              {/* Subtle hover radial glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#8063F7]/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />

              {/* Content area */}
              <div className="relative z-10 flex flex-col flex-1 justify-between space-y-4">
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between gap-2 text-xs text-[#858EA8]">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[#A5ABC1]">
                    <Calendar className="w-3.5 h-3.5 text-[#8063F7]" />
                    {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {post.category && (
                      <span className="inline-block text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 border border-[#8063F7]/30 bg-[#8063F7]/15 text-[#A995FF] rounded-md backdrop-blur-sm">
                        {post.category.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 backdrop-blur-sm px-2 py-0.5 rounded-md bg-[#101426]/60 border border-[#292D45]/50">
                      <Clock className="w-3.5 h-3.5 text-[#858EA8]" />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Left-side Text: Vertically aligned along left edge and vertically centered in card */}
                <div className="my-auto space-y-1.5">
                  <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F5F6FC] transition-colors group-hover:text-[#A995FF]">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-sm font-normal text-[#A5ABC1] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#292D45]/60 flex items-center justify-between mt-auto">
                  <BlogInteractionButtons
                    postId={post.id}
                    postSlug={post.slug}
                    initialLikesCount={post.likesCount || 0}
                    initialLikedByMe={post.likedByMe}
                  />
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3.5 rounded-lg border border-[#8063F7]/40 bg-[#8063F7]/10 text-xs sm:text-sm font-semibold text-[#A995FF] hover:bg-[#8063F7] hover:text-white hover:border-[#8063F7] transition-all duration-200 active:scale-95 ml-auto"
                  >
                    <span>{t('readArticle')}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
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