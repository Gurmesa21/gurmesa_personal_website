import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ContentCardProps {
  media?: {
    url?: string | null;
    mimeType?: string | null;
    altText?: string | null;
  } | null;
  fallbackIcon?: LucideIcon;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  title: string;
  description?: string | null;
  href?: string;
  footerLeft?: React.ReactNode;
  footerCta?: React.ReactNode;
  priority?: boolean;
  className?: string;
}

export function ContentCard({
  media,
  fallbackIcon: FallbackIcon,
  icon,
  badge,
  title,
  description,
  href,
  footerLeft,
  footerCta,
  priority = false,
  className,
}: ContentCardProps) {
  const isVideo =
    media?.mimeType?.startsWith('video/') ||
    media?.url?.endsWith('.mp4') ||
    media?.url?.endsWith('.webm');

  return (
    <article
      data-card
      className={cn(
        'group relative isolate flex flex-col h-full justify-between overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-4.5 sm:p-5 lg:p-6 shadow-xl shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10 touch-manipulation min-w-0',
        className
      )}
    >
      {/* Thin Top Accent Line Animation */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      {/* Static Background Media Layer: covers entire card behind text */}
      <div data-card-media-bg className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#080B16]">
        {media?.url ? (
          isVideo ? (
            <video
              src={media.url}
              className="h-full w-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <Image
              src={media.url}
              alt={media.altText || title}
              fill
              unoptimized
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="h-full w-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          )
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-[#171D32] via-[#101426] to-[#171D32]/80 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-[#8063F7]/15 to-transparent" />
            {FallbackIcon && (
              <FallbackIcon className="h-12 w-12 text-[#8063F7]/25" aria-hidden="true" />
            )}
          </div>
        )}
        {/* Gradient overlay: ensures crisp text readability over background media */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B16]/95 via-[#080B16]/82 to-[#080B16]/50 group-hover:via-[#080B16]/75 group-hover:to-[#080B16]/40 transition-all duration-300" />
      </div>

      {/* Subtle hover radial glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#8063F7]/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      {/* Foreground Content: sits cleanly on top of background media */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0">
        <div className="space-y-2.5 min-w-0">
          {/* Top Meta / Icon / Badge Row */}
          {(icon || badge) && (
            <div className="flex items-center justify-between gap-2">
              {icon && <div className="flex items-center">{icon}</div>}
              {badge && <div className="flex items-center ml-auto">{badge}</div>}
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-1 min-w-0">
            <h3 className="font-heading text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[#F5F6FC] break-words line-clamp-2 transition-colors group-hover:text-[#A995FF]">
              {href ? (
                <Link href={href} className="focus:outline-none focus:underline hover:underline">
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>

            {description && (
              <p className="text-xs sm:text-sm font-normal leading-relaxed text-[#A5ABC1] line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Footer: pinned to bottom via mt-auto, row baseline-aligned */}
        {(footerLeft || footerCta) && (
          <div
            data-card-footer
            className="mt-auto pt-3 border-t border-[#292D45]/60 flex items-center justify-between gap-3 text-xs min-h-[48px]"
          >
            {footerLeft && (
              <div className="min-w-0 flex-1 truncate text-xs text-[#A5ABC1]">
                {footerLeft}
              </div>
            )}
            {footerCta && (
              <div className="shrink-0 ml-auto">
                {footerCta}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
