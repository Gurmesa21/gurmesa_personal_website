import React from 'react';
import Link from 'next/link';
import { MediaFrame, MediaFrameProps } from './MediaFrame';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ContentCardProps {
  media?: MediaFrameProps['media'];
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
  fallbackIcon,
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
  return (
    <article
      data-card
      className={cn(
        'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] shadow-xl shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10 touch-manipulation',
        className
      )}
    >
      {/* Thin Top Accent Line Animation */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      {/* Subtle hover radial glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#8063F7]/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      {/* Media on top: full bleed to card edges, never behind text */}
      {href ? (
        <Link href={href} className="block overflow-hidden focus:outline-none" tabIndex={-1} aria-label={title}>
          <MediaFrame
            media={media}
            fallbackIcon={fallbackIcon}
            title={title}
            priority={priority}
          />
        </Link>
      ) : (
        <MediaFrame
          media={media}
          fallbackIcon={fallbackIcon}
          title={title}
          priority={priority}
        />
      )}

      {/* Card Body */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {/* Meta / Icon / Badge Row (above title) */}
        {(icon || badge) && (
          <div className="flex items-center justify-between gap-2">
            {icon && <div className="flex items-center">{icon}</div>}
            {badge && <div className="flex items-center ml-auto">{badge}</div>}
          </div>
        )}

        {/* Title */}
        <h3 className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-[#F5F6FC] break-words line-clamp-2 transition-colors group-hover:text-[#A995FF]">
          {href ? (
            <Link href={href} className="focus:outline-none focus:underline hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm font-normal leading-relaxed text-[#A5ABC1] line-clamp-3">
            {description}
          </p>
        )}

        {/* Footer */}
        {(footerLeft || footerCta) && (
          <div className="mt-auto border-t border-[#292D45]/60 pt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            {footerLeft && (
              <div className="min-w-0 max-w-full text-xs text-[#A5ABC1]">
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

