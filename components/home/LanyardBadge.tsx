'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanyardBadgeProps {
  name: string;
  title: string;
  location: string;
  avatarUrl?: string | null;
  avatarMimeType?: string | null;
  ariaLabel?: string;
  size?: 'hero' | 'about';
  className?: string;
}

export function LanyardBadge({
  name,
  title,
  location,
  avatarUrl,
  avatarMimeType,
  ariaLabel = 'Profile badge',
  size = 'hero',
  className,
}: LanyardBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const badgeCardRef = useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentAngleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Pause animation when scrolled offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPaused(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pointer drag and spring return physics
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary mouse click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    isDraggingRef.current = true;
    startXRef.current = e.clientX;

    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {}

    if (groupRef.current) {
      groupRef.current.classList.remove('lanyard-group-anim');
      groupRef.current.style.willChange = 'transform';
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !groupRef.current) return;

    const dx = e.clientX - startXRef.current;
    // Rotation = clamp(dx / 10, -18, 18)
    const angle = Math.max(-18, Math.min(18, dx / 10));
    currentAngleRef.current = angle;
    groupRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    // Damped harmonic oscillator return: stiffness = 120, damping = 9
    let theta = currentAngleRef.current;
    let omega = 0;
    const k = 120;
    const c = 9;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;

      const force = -k * theta - c * omega;
      omega += force * dt;
      theta += omega * dt;

      if (groupRef.current) {
        groupRef.current.style.transform = `rotate(${theta.toFixed(2)}deg)`;
      }

      if (Math.abs(theta) < 0.08 && Math.abs(omega) < 0.15) {
        // Returned to equilibrium: resume idle animation
        if (groupRef.current) {
          groupRef.current.style.transform = '';
          groupRef.current.style.willChange = '';
          groupRef.current.classList.add('lanyard-group-anim');
        }
        animFrameRef.current = null;
      } else {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  return (
    <div
      ref={containerRef}
      data-testid="lanyard-badge-container"
      data-paused={isPaused ? 'true' : undefined}
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'relative flex flex-col items-center select-none pt-0 shrink-0',
        className
      )}
    >
      {/* Group: Strap + Clasp + Badge Card (pivots at top center) */}
      <div
        ref={groupRef}
        data-testid="lanyard-group"
        className="lanyard-group-anim flex flex-col items-center"
      >
        {/* Lanyard Fabric Strap */}
        <div
          aria-hidden="true"
          className="relative w-8 h-12 sm:h-14 overflow-hidden rounded-b-sm bg-gradient-to-b from-[#8063F7] via-[#5C45D3] to-[#4F6FF0] shadow-md flex items-center justify-center border-x border-t border-[#8063F7]/50"
        >
          {/* Subtle repeated AVENOR wordmark pattern */}
          <div className="flex flex-col items-center justify-center gap-1.5 opacity-35 text-[7.5px] font-black tracking-[0.22em] text-white uppercase select-none leading-none rotate-90">
            <span>AVENOR</span>
          </div>
        </div>

        {/* Metal Clip / Clasp (Silver metallic gradient, aria-hidden) */}
        <div aria-hidden="true" className="relative flex flex-col items-center -mt-0.5 z-10">
          <svg
            width="28"
            height="22"
            viewBox="0 0 28 22"
            fill="none"
            className="drop-shadow-sm"
          >
            <defs>
              <linearGradient id="clipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
            </defs>
            {/* Upper clip bracket */}
            <rect x="5" y="0" width="18" height="5" rx="1.5" fill="url(#clipGrad)" stroke="#475569" strokeWidth="0.5" />
            {/* Neck pivot */}
            <rect x="11" y="4.5" width="6" height="5" rx="1" fill="url(#clipGrad)" stroke="#475569" strokeWidth="0.5" />
            {/* Clasp hook loop going through badge slot */}
            <path
              d="M9 9.5 C9 16 19 16 19 9.5"
              stroke="url(#clipGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Badge Card */}
        <div
          ref={badgeCardRef}
          data-testid="lanyard-badge-card"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={cn(
            'lanyard-badge-anim relative -mt-1.5 aspect-[5/7.2] rounded-[20px] border border-[#8063F7]/35 bg-[#101426]/95 backdrop-blur-md p-3.5 sm:p-4 flex flex-col shadow-[0_16px_40px_-8px_rgba(128,99,247,0.22)] shadow-black/60 transition-[box-shadow,transform] duration-200 cursor-grab active:cursor-grabbing active:scale-[0.98] hover:shadow-[0_20px_48px_-6px_rgba(128,99,247,0.32)] hover:-translate-y-1 touch-manipulation',
            size === 'about'
              ? 'w-[220px] sm:w-[235px] md:w-[250px] lg:w-[260px] max-w-[280px]'
              : 'w-[220px] sm:w-[245px] lg:w-[260px]'
          )}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Punched Slot at top (decorative) */}
          <div
            aria-hidden="true"
            className="w-8 h-1.5 rounded-full bg-[#080B16] border border-[#292D45] mx-auto mb-2.5 shrink-0 shadow-inner"
          />

          {/* Profile Photo: upper ~62% of card */}
          <div
            className={cn(
              'relative w-full aspect-[4/4.6] rounded-xl overflow-hidden bg-[#080B16] border border-[#292D45] shrink-0',
              size === 'about' && 'w-48 h-48 mx-auto'
            )}
          >
            {avatarUrl ? (
              avatarMimeType?.startsWith('video/') ? (
                <video
                  src={avatarUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <Image
                  src={avatarUrl}
                  alt={name || 'Avatar'}
                  fill
                  priority
                  sizes="(max-width: 640px) 220px, 260px"
                  className="object-cover object-top"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#171D32] to-[#101426]">
                <span className="font-heading font-extrabold text-2xl text-[#8063F7]">
                  GT
                </span>
              </div>
            )}
          </div>

          {/* Badge Content Below Photo */}
          <div className="mt-2.5 sm:mt-3 flex-1 flex flex-col justify-between min-w-0">
            <div>
              {/* Name */}
              <h2
                data-testid="badge-name"
                className="font-heading font-extrabold text-sm sm:text-base text-[#F5F6FC] leading-snug line-clamp-1 truncate"
              >
                {name}
              </h2>

              {/* Professional Title */}
              <p
                data-testid="badge-title"
                className="text-[11px] sm:text-xs font-semibold text-[#C4B5FD] truncate mt-0.5"
              >
                {title}
              </p>
            </div>

            {/* Location with Pin */}
            <div
              data-testid="badge-location"
              className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-[#CBD5E1] mt-1.5 truncate"
            >
              <MapPin className="w-3 h-3 text-[#C4B5FD] shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

