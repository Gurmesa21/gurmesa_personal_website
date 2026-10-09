'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Check } from 'lucide-react';
import { toggleLike } from '@/app/actions/blog';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface BlogInteractionButtonsProps {
  postId: string;
  postSlug: string;
  initialLikesCount: number;
  initialLikedByMe?: boolean;
}

export function BlogInteractionButtons({ postId, postSlug, initialLikesCount, initialLikedByMe }: BlogInteractionButtonsProps) {
  const [isLiked, setIsLiked] = useState(!!initialLikedByMe);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const router = useRouter();
  const t = useTranslations('Blog');

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!previousLiked);
    setLikesCount(prev => (previousLiked ? Math.max(0, prev - 1) : prev + 1));

    const result = await toggleLike(postId);
    
    if (!result.success) {
      // Rollback
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      console.error(result.error);
    } else if (result.likesCount !== undefined && result.likedByMe !== undefined) {
      setIsLiked(result.likedByMe);
      setLikesCount(result.likesCount);
    }
    
    setIsLiking(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${postSlug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('checkOutPost'),
          url
        });
      } catch (err) {
        // Fallback to copy if user cancels or it fails
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
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCommentClick = () => {
    router.push(`/blog/${postSlug}#comments`);
  };

  return (
    <div className="flex items-center gap-4 sm:gap-6 text-slate-500 dark:text-slate-400">
      <button 
        onClick={handleLike}
        disabled={isLiking}
        aria-pressed={isLiked}
        aria-label={isLiked ? t('unlike') : t('like')}
        className={cn(
          "flex items-center gap-2 transition-all duration-300 active:scale-95 group/like",
          isLiked ? "text-rose-500" : "hover:text-rose-500"
        )}
      >
        <Heart 
          className={cn("w-5 h-5 transition-transform group-hover/like:scale-110", isLiked && "fill-current")} 
        />
        <span className="text-sm font-medium w-4 text-left">
          {likesCount > 0 ? likesCount : ''}
        </span>
        <span className="sr-only">{isLiked ? t('unlike') : t('like')}</span>
      </button>

      <button 
        onClick={handleCommentClick}
        aria-label={t('comment')}
        className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-300 active:scale-95 group/comment"
      >
        <MessageCircle className="w-5 h-5 transition-transform group-hover/comment:scale-110" />
        <span className="text-sm font-medium hidden sm:inline">{t('comment')}</span>
      </button>

      <button 
        onClick={handleShare}
        aria-live="polite"
        aria-label={isCopied ? t('copied') : t('share')}
        className={cn(
          "flex items-center gap-2 transition-colors duration-300 active:scale-95 group/share",
          isCopied ? "text-emerald-500" : "hover:text-emerald-500"
        )}
      >
        {isCopied ? (
          <Check className="w-5 h-5" />
        ) : (
          <Share2 className="w-5 h-5 transition-transform group-hover/share:scale-110" />
        )}
        <span className="text-sm font-medium hidden sm:inline">
          {isCopied ? t('copied') : t('share')}
        </span>
      </button>
    </div>
  );
}
