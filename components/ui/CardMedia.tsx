'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Code2, Cpu, Palette, Server, Layers, FolderGit2 } from 'lucide-react';

function getFallbackIcon(name?: string) {
  switch (name?.toLowerCase()) {
    case 'code':
    case 'code2':
    case 'web-development':
      return Code2;
    case 'cpu':
    case 'consulting':
    case 'technical-consulting':
      return Cpu;
    case 'palette':
    case 'ui-design':
    case 'ui-ux-design':
      return Palette;
    case 'server':
    case 'caching-service':
      return Server;
    case 'project':
    case 'work':
    case 'folder':
      return FolderGit2;
    default:
      return Layers;
  }
}

interface CardMediaProps {
  mediaObj: {
    url: string;
    mimeType: string;
    altText?: string | null;
  } | null;
  title: string;
  iconName?: string;
  className?: string;
  priority?: boolean;
}

export function CardMedia({
  mediaObj,
  title,
  iconName,
  className,
  priority = false,
}: CardMediaProps) {
  const isVideo =
    mediaObj?.mimeType?.startsWith('video/') ||
    mediaObj?.url?.endsWith('.mp4') ||
    mediaObj?.url?.endsWith('.webm');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isVideo || !containerRef.current) return;

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {
            // Ignore autoplay rejection
          });
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVideo]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full aspect-video rounded-xl overflow-hidden bg-[#080B16] border border-[#292D45]/70 flex items-center justify-center',
        className
      )}
    >
      {mediaObj ? (
        isVideo ? (
          <video
            ref={videoRef}
            src={mediaObj.url}
            preload="metadata"
            muted
            playsInline
            loop
            width={1280}
            height={720}
            className="w-full h-full object-contain bg-[#080B16] transition-transform duration-500 ease-out group-hover:scale-105"
            aria-label={mediaObj.altText || title}
          >
            <source src={mediaObj.url} type={mediaObj.mimeType || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={mediaObj.url}
            alt={mediaObj.altText || title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-full object-cover object-contain bg-[#080B16] transition-transform duration-500 ease-out group-hover:scale-105"
            style={{ objectFit: 'contain' }}
          />
        )
      ) : (
        <div className="relative w-full h-full aspect-video bg-gradient-to-br from-[#171D32] via-[#101426] to-[#171D32]/80 flex flex-col items-center justify-center gap-2">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#8063F7]/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#4F6FF0]/10 blur-xl" />
          <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-[#8063F7]/30 bg-[#101426] text-[#8063F7] shadow-inner">
            {(() => {
              const FallbackIcon = getFallbackIcon(iconName);
              return <FallbackIcon className="w-5 h-5 opacity-80" />;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
