import Image from 'next/image';
import { CardVideo } from './CardVideo';
import { LucideIcon, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaFrameProps {
  media?: {
    url?: string | null;
    mimeType?: string | null;
    altText?: string | null;
  } | null;
  fallbackIcon?: LucideIcon;
  title?: string;
  priority?: boolean;
  className?: string;
}

export function MediaFrame({
  media,
  fallbackIcon: Icon = Layers,
  title = '',
  priority = false,
  className,
}: MediaFrameProps) {
  const isVideo =
    media?.mimeType?.startsWith('video/') ||
    media?.url?.endsWith('.mp4') ||
    media?.url?.endsWith('.webm');

  const isPortrait =
    media?.url?.includes('9-16') ||
    media?.url?.includes('9_16') ||
    media?.url?.includes('portrait');

  return (
    <div
      data-media-frame
      className={cn(
        'relative w-full aspect-video overflow-hidden bg-[color:var(--surface-2,#171D32)] shrink-0',
        className
      )}
    >
      {media?.url ? (
        isVideo ? (
          <CardVideo
            src={media.url}
            ariaLabel={media.altText || title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={media.url}
            alt={media.altText || title}
            fill
            unoptimized
            priority={priority}
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className={cn(
              'object-cover transition-transform duration-500 ease-out group-hover:scale-105',
              isPortrait ? 'object-top [object-position:center_top]' : 'object-center [object-position:center]'
            )}
            style={{ objectFit: 'cover', objectPosition: isPortrait ? 'center top' : 'center' }}
          />
        )
      ) : (
        <div className="relative w-full h-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-[#171D32] via-[#101426] to-[#171D32]/80">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#8063F7]/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#4F6FF0]/10 blur-xl" />
          <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-[#8063F7]/30 bg-[#101426] text-[#8063F7] shadow-inner">
            <Icon className="w-5 h-5 opacity-80" />
          </div>
        </div>
      )}
    </div>
  );
}
