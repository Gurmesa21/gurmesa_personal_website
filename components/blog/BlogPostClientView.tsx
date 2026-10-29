'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { MediaRenderer } from '@/components/ui/MediaRenderer';
import { Button } from '@/components/ui/button';
import { toggleLike, addComment } from '@/app/actions/blog';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Check,
  User,
  Tag,
  ImageIcon,
  AlertCircle,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';

export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
  likesCount: number;
  likedByMe?: boolean;
  category: { id: string; name: string; slug: string } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
  comments?: { id: string; author: string; content: string; createdAt: string }[];
}

export interface BlogPostClientViewProps {
  post: BlogPostData;
  mediaObj: {
    url: string;
    mimeType: string;
    altText: string;
  } | null;
  readTime: string;
  authorName?: string;
  profile?: {
    name: string;
    title: string;
    tagline: string;
    bio: string;
    locationLabel?: string | null;
    availabilityStatus?: string | null;
    avatarUrl?: string | null;
  } | null;
  socialLinks?: {
    id: string;
    platform: string;
    url: string;
    label: string;
    order: number;
  }[];
  resumeUrl?: string | null;
  avatarMedia?: {
    url: string;
    mimeType: string;
    altText: string;
  } | null;
}

export function BlogPostClientView({
  post,
  mediaObj,
  readTime,
  profile,
  socialLinks,
  resumeUrl,
  avatarMedia
}: BlogPostClientViewProps) {
  const t = useTranslations('Blog');
  const tHome = useTranslations('Home');
  const tNav = useTranslations('Navigation');

  // Active view: 'article' (default reading) or 'comments' (on-demand dedicated screen)
  const [view, setView] = useState<'article' | 'comments'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#comments') {
      return 'comments';
    }
    return 'article';
  });
  const savedScrollY = useRef<number>(0);

  // Social interactions state
  const [isLiked, setIsLiked] = useState(!!post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Comments list derived from post
  const commentsList = post.comments || [];

  // Persistent comment form state (preserved across view toggles)
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check URL hash on hashchange (e.g. if navigated via /blog/[slug]#comments)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#comments') {
        savedScrollY.current = window.scrollY;
        setView('comments');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle switching to comments view
  const handleOpenComments = () => {
    savedScrollY.current = window.scrollY;
    setView('comments');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle returning to article view and restoring scroll position
  const handleBackToPost = () => {
    setView('article');
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
    });
  };

  // Handle like toggle
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    setLikesCount(prev => (prevLiked ? Math.max(0, prev - 1) : prev + 1));

    const result = await toggleLike(post.id);
    if (!result.success) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } else if (result.likesCount !== undefined && result.likedByMe !== undefined) {
      setIsLiked(result.likedByMe);
      setLikesCount(result.likesCount);
    }

    setIsLiking(false);
  };

  // Handle share action
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url
        });
      } catch {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !email.trim() || !content.trim()) {
      setSubmitError(t('fieldsRequired') || 'Name, email, and comment are required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    const result = await addComment(post.id, { author, email, content, honeypot });

    if (result.success) {
      setSubmitSuccess(true);
      setContent('');
      // Keep author and email for user convenience, clear content
    } else {
      setSubmitError(result.error || t('failedToComment') || 'Failed to submit comment.');
    }

    setIsSubmitting(false);
  };

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    : '';

  // =========================================================================
  // VIEW 2: DEDICATED COMMENTS VIEW (On-Demand)
  // =========================================================================
  if (view === 'comments') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-200">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292D45]">
          <button
            onClick={handleBackToPost}
            aria-label={t('backToArticle') || 'Back to Article'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8063F7] hover:text-[#A995FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8063F7]/50 rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToArticle') || 'Back to Article'}</span>
          </button>

          <span className="text-xs text-[#A5ABC1] truncate max-w-xs hidden sm:inline">
            {post.title}
          </span>
        </div>

        {/* Comments Title Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#8063F7]">
                <MessageCircle className="w-4 h-4" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#F5F6FC]">
                {t('commentsTitle')}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#292D45] bg-[#101426] text-[#A5ABC1]">
                {commentsList.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A5ABC1] pl-10">
              {t('joinConversation') || 'Join the conversation and share your insights on this topic.'}
            </p>
          </div>
        </div>

        {/* Compose Comment Form Panel */}
        <div className="rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F5F6FC]">
            {t('leaveComment')}
          </h2>

          {submitError && (
            <div className="flex items-center gap-2 p-3 text-sm text-[#FF5C8A] bg-[#FF5C8A]/10 border border-[#FF5C8A]/25 rounded-xl" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-xl" role="status">
              <Check className="w-4 h-4 shrink-0" />
              <span>{t('commentSubmittedForReview') || 'Your comment has been submitted and will appear after review.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmitComment} className="space-y-4">
            {/* Honeypot field */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ display: 'none' }}
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="comment-author" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#A5ABC1]">
                  {t('yourName')} <span className="text-[#8063F7]">*</span>
                </label>
                <input
                  id="comment-author"
                  type="text"
                  placeholder={t('yourName') || 'Your Name'}
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full bg-[#171D32] border border-[#292D45] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F6FC] placeholder:text-[#A5ABC1]/50 focus:outline-none focus:border-[#8063F7] focus:ring-1 focus:ring-[#8063F7] transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="comment-email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#A5ABC1]">
                  {t('yourEmail') || 'Your Email'} <span className="text-[#8063F7]">*</span>
                </label>
                <input
                  id="comment-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#171D32] border border-[#292D45] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F6FC] placeholder:text-[#A5ABC1]/50 focus:outline-none focus:border-[#8063F7] focus:ring-1 focus:ring-[#8063F7] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="comment-content" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#A5ABC1]">
                {t('yourThoughts')} <span className="text-[#8063F7]">*</span>
              </label>
              <textarea
                id="comment-content"
                rows={3}
                placeholder={t('yourThoughts')}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-[#171D32] border border-[#292D45] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F6FC] placeholder:text-[#A5ABC1]/50 focus:outline-none focus:border-[#8063F7] focus:ring-1 focus:ring-[#8063F7] transition-colors resize-none"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-[#A5ABC1]">
                {t('commentModerationNotice') || 'Comments are moderated to maintain high-quality discussions.'}
              </p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/25 hover:from-[#7154e6] hover:to-[#3e5edb] active:scale-95 transition-all shrink-0"
              >
                {isSubmitting ? (t('posting') || 'Posting...') : (t('postComment') || 'Post Comment')}
              </Button>
            </div>
          </form>
        </div>

        {/* Existing Comments Feed */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
            {t('discussionStream') || 'Discussion Stream'}
          </h2>

          {commentsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#292D45] bg-[#101426]/50 p-8 sm:p-12 text-center space-y-2">
              <MessageCircle className="w-8 h-8 text-[#A5ABC1]/60 mx-auto" />
              <p className="text-sm font-medium text-[#F5F6FC]">{t('noCommentsYet') || 'No comments yet'}</p>
              <p className="text-xs text-[#A5ABC1]">
                {t('noComments') || 'Be the first to share your thoughts on this article!'}
              </p>
            </div>
          ) : (
            commentsList.map(comment => (
              <div
                key={comment.id}
                className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border border-[#292D45] bg-[#101426] shadow-md transition-all hover:border-[#8063F7]/40"
              >
                <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#171D32] to-[#101426] border border-[#292D45] flex items-center justify-center text-[#8063F7] font-bold text-xs uppercase shadow-inner">
                  {comment.author.charAt(0) || <User className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-bold text-sm text-[#F5F6FC] truncate">
                      {comment.author}
                    </span>
                    <span className="text-[11px] text-[#A5ABC1] shrink-0">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Back Button */}
        <div className="pt-4 text-center">
          <button
            onClick={handleBackToPost}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8063F7] hover:text-[#A995FF] transition-colors py-2 px-4 rounded-xl border border-[#8063F7]/30 hover:border-[#8063F7] bg-[#8063F7]/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToArticle') || 'Return to Article'}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ARTICLE READING VIEW (Default, clean without sprawling comment form)
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 lg:space-y-10">
      {/* Compact Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#A5ABC1]">
        <Link href="/" className="hover:text-[#F5F6FC] transition-colors">{tNav('home')}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#292D45]" />
        <Link href="/blog" className="hover:text-[#F5F6FC] transition-colors">{tNav('blog')}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#292D45]" />
        <span className="text-[#F5F6FC] font-medium truncate max-w-[240px] sm:max-w-md">{post.title}</span>
      </nav>

      <h1 className="sr-only">
        {post.title}
      </h1>

      {/* Badges / Meta */}
      <div className="flex flex-wrap items-center gap-2.5">
        {post.category && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#A995FF]">
            {post.category.name}
          </span>
        )}
        {formattedDate && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#292D45] bg-[#101426] text-[#A5ABC1]">
            <Calendar className="w-3.5 h-3.5 text-[#8063F7]" />
            {formattedDate}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#292D45] bg-[#101426] text-[#A5ABC1]">
          <Clock className="w-3.5 h-3.5 text-[#8063F7]" />
          {readTime}
        </span>
      </div>

      {/* Wide Featured Media Banner */}
      <div className="relative w-full aspect-[21/9] min-h-[260px] max-h-[460px] rounded-2xl overflow-hidden border border-[#292D45] bg-[#101426] shadow-2xl flex items-center justify-center">
        {mediaObj ? (
          <MediaRenderer
            url={mediaObj.url}
            mimeType={mediaObj.mimeType}
            altText={mediaObj.altText}
            fill
            className="object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-gradient-to-br from-[#171D32] via-[#101426] to-[#171D32]/80 flex flex-col items-center justify-center gap-3">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#8063F7]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#4F6FF0]/15 blur-3xl" />
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8063F7]/30 bg-[#101426] text-[#8063F7] shadow-inner">
              <ImageIcon className="w-8 h-8 opacity-80" />
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Reading Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Main Article Reading Measure (~72% width on desktop) */}
        <article className="lg:col-span-8 min-w-0 space-y-8">
          {/* Main Article Content with comfortable reading measure and rich typography */}
          <div className="rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-8 md:p-10 shadow-xl">
            <div className="prose prose-invert max-w-none text-[#F5F6FC] leading-relaxed prose-headings:font-heading prose-headings:text-[#F5F6FC] prose-headings:font-bold prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-[#A5ABC1] prose-p:leading-[1.75] prose-p:text-base sm:prose-p:text-[17px] prose-p:mb-5 prose-li:text-[#A5ABC1] prose-strong:text-[#F5F6FC] prose-a:text-[#A995FF] hover:prose-a:text-white prose-blockquote:border-l-4 prose-blockquote:border-[#8063F7] prose-blockquote:bg-[#171D32]/40 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-[#A5ABC1] prose-blockquote:italic prose-code:text-[#A995FF] prose-code:bg-[#171D32] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:border prose-pre:border-[#292D45] prose-pre:bg-[#171D32] prose-pre:rounded-xl">
              <MarkdownRenderer content={post.body} />
            </div>

            {/* Tags row inside article if available */}
            {post.tags.length > 0 && (
              <div className="pt-6 mt-8 border-t border-[#292D45]/60 flex flex-wrap items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#8063F7]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1] mr-1">{t('tags') || 'Tags:'}</span>
                {post.tags.map(t => (
                  <span
                    key={t.tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-[#292D45] bg-[#171D32] text-[#A5ABC1]"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Compact Social Action Bar at the bottom of the article card */}
            <div className="pt-6 mt-8 border-t border-[#292D45] flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  aria-pressed={isLiked}
                  aria-label={isLiked ? (t('unlike') || 'Unlike') : (t('like') || 'Like')}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#292D45] bg-[#171D32]/70 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 group",
                    isLiked
                      ? "text-[#FF5C8A] border-[#FF5C8A]/30 bg-[#FF5C8A]/10"
                      : "text-[#A5ABC1] hover:text-[#FF5C8A] hover:border-[#FF5C8A]/30"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-transform group-hover:scale-110",
                      isLiked && "fill-current"
                    )}
                  />
                  <span>{likesCount > 0 ? likesCount : (t('like') || 'Like')}</span>
                </button>

                {/* Comment Action Button — Switches to dedicated comments view */}
                <button
                  onClick={handleOpenComments}
                  aria-label="View Comments"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#292D45] bg-[#171D32]/70 text-xs sm:text-sm font-medium text-[#A5ABC1] hover:text-[#8063F7] hover:border-[#8063F7]/30 transition-all duration-200 active:scale-95 group"
                >
                  <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>
                    {commentsList.length > 0 ? `${commentsList.length} ${t('commentsTitle') || 'Comments'}` : (t('comment') || 'Comment')}
                  </span>
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                aria-label={isCopied ? (t('copied') || 'Copied!') : (t('share') || 'Share')}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#292D45] bg-[#171D32]/70 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95",
                  isCopied
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : "text-[#A5ABC1] hover:text-[#8063F7] hover:border-[#8063F7]/30"
                )}
              >
                {isCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>{isCopied ? (t('copied') || 'Copied!') : (t('share') || 'Share')}</span>
              </button>
            </div>
          </div>
        </article>

        {/* Right Editorial Sidebar (~28% width on desktop) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* -----------------------------------------------------------------------
              PROFILE / ABOUT SUMMARY CARD (Exact from homepage bottom)
             ----------------------------------------------------------------------- */}
          <div className="group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
            {/* Thin Top Accent Line Animation */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

            <div>
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {avatarMedia ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#8063F7]/50 bg-[#171D32] flex items-center justify-center">
                      <MediaRenderer
                        url={avatarMedia.url}
                        mimeType={avatarMedia.mimeType}
                        altText={profile?.name || 'Avatar'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#292D45] bg-[#171D32] text-[#8063F7]">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <h2 className="font-heading text-base sm:text-lg font-bold text-[#F5F6FC]">
                    {tHome('aboutMe') || 'About Me'}
                  </h2>
                </div>
                <Link
                  href="/about"
                  className="group flex items-center gap-0.5 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-2.5 py-1 text-xs font-medium text-[#10B981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    {tHome('readFullBio') || 'Read Full Bio'}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#F5F6FC]">
                    {profile?.name || 'Gurmesa Teklemariam'}
                  </h3>
                  <p className="text-[11px] font-medium text-[#A995FF]">
                    {profile?.title}
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-[#A5ABC1] line-clamp-3">
                  {profile?.bio}
                </p>

                {socialLinks && socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {socialLinks.slice(0, 3).map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-[#292D45] bg-[#101426] p-5 shadow-lg shadow-black/30 px-2 py-0.5 text-[10px] font-medium text-[#A5ABC1] transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#292D45]/60 pt-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#A995FF] transition-colors hover:text-white"
              >
                {tHome('readFullBio') || 'Read Full Bio'}
                <ArrowRight className="h-3 w-3" />
              </Link>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#A5ABC1] transition-colors hover:text-[#F5F6FC]"
                >
                  {tHome('downloadResume') || 'Resume'}
                </a>
              )}
            </div>
          </div>

          {/* Discussion Card Prompt */}

          <div className="rounded-2xl border border-[#292D45] bg-[#101426] p-5 shadow-lg shadow-black/30 from-[#101426] via-[#171D32]/60 to-[#101426] p-5 sm:p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
                {t('discussion') || 'Discussion'}
              </span>
              <span className="text-xs font-mono font-bold text-[#8063F7] bg-[#8063F7]/10 border border-[#8063F7]/25 px-2 py-0.5 rounded">
                {commentsList.length}
              </span>
            </div>
            <h4 className="font-heading font-bold text-base text-[#F5F6FC]">
              {t('haveThoughts') || 'Have thoughts on this?'}
            </h4>
            <p className="text-xs text-[#A5ABC1] leading-relaxed">
              {t('discussionPrompt') || 'Read what other developers are saying or share your own perspective on this article.'}
            </p>
            <Button
              onClick={handleOpenComments}
              className="w-full rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/25 hover:from-[#7154e6] hover:to-[#3e5edb] active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>{commentsList.length > 0 ? `${commentsList.length} ${t('commentsTitle') || 'Comments'}` : (t('leaveComment') || 'Leave a Comment')}</span>
            </Button>
          </div>

          {/* Quick Nav back to Blog */}
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-[#A5ABC1] hover:text-[#8063F7] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('backToAllArticles') || 'Back to all articles'}</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
