'use client';

import { useRef, useEffect } from 'react';

interface CardVideoProps {
  src: string;
  poster?: string;
  className?: string;
  ariaLabel?: string;
}

export function CardVideo({ src, poster, className, ariaLabel }: CardVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
      className={className || 'absolute inset-0 h-full w-full object-cover'}
    />
  );
}
