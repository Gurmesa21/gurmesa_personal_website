'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ShieldCheck, GraduationCap, MapPin } from 'lucide-react';

interface EngineerBadgeProps {
  profile?: {
    name?: string | null;
    title?: string | null;
    bio?: string | null;
    locationLabel?: string | null;
    availabilityStatus?: string | null;
  } | null;
  avatarUrl?: string | null;
  tBadgeHeader?: string;
  tAcademicStudent?: string;
  tStatusAvailable?: string;
  tBadgeLocation?: string;
  tBadgeIdCode?: string;
}

export function EngineerBadge({
  profile,
  avatarUrl,
  tBadgeHeader = 'ENGINEER ID // VERIFIED',
  tAcademicStudent = '4th-year Software Engineering Student @ ASTU',
  tStatusAvailable = 'Available for projects',
  tBadgeLocation = 'Ethiopia',
  tBadgeIdCode = 'ID: AVN-2026-GT',
}: EngineerBadgeProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [hoverCapable, setHoverCapable] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Check hover capability
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handleHoverChange = (e: MediaQueryListEvent) => setHoverCapable(e.matches);
    hoverQuery.addEventListener('change', handleHoverChange);

    // Pause animations when card is out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      hoverQuery.removeEventListener('change', handleHoverChange);
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !hoverCapable || !isIntersecting || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle tilt: max 9 degrees rotation
    const rotateX = ((y - centerY) / centerY) * -9;
    const rotateY = ((x - centerX) / centerX) * 9;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const name = profile?.name || 'Gurmesa Teklemariam';
  const title = profile?.title || 'Full Stack & AI Engineer';
  const location = profile?.locationLabel || tBadgeLocation;
  const status = profile?.availabilityStatus || tStatusAvailable;

  const techChips = ['Next.js', 'TypeScript', 'Node.js', 'Python', 'Tailwind'];

  const isTilted = tilt.x !== 0 || tilt.y !== 0;

  return (
    <div
      data-testid="engineer-badge-container"
      className="relative w-full max-w-[280px] sm:max-w-xs select-none"
      style={{ perspective: '1000px' }}
    >
      {/* Outer ambient glow — breathing animation paused when offscreen or reduced-motion */}
      <div
        className={`pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8063F7]/30 via-[#4F6FF0]/20 to-[#8063F7]/30 blur-lg transition-opacity duration-500 ${
          reducedMotion || !isIntersecting ? 'opacity-30' : 'opacity-60 animate-pulse'
        }`}
        aria-hidden="true"
      />

      {/* Tiltable Badge Card */}
      <div
        ref={cardRef}
        data-testid="engineer-badge"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426]/90 p-4.5 sm:p-5 shadow-2xl backdrop-blur-md transition-all duration-300 ease-out hover:border-[#8063F7]/70"
        style={{
          transform:
            !reducedMotion && hoverCapable
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`
              : undefined,
          transition: isTilted ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out, border-color 0.3s ease',
          boxShadow: isIntersecting && !reducedMotion
            ? '0 0 25px rgba(128, 99, 247, 0.15)'
            : '0 10px 25px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Holographic light reflection sheen */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-60"
          aria-hidden="true"
        />

        {/* Badge Header Row */}
        <div className="flex items-center justify-between border-b border-[#292D45]/80 pb-3 text-[10px] sm:text-[11px] font-mono tracking-wider text-[#A995FF] uppercase">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`h-2 w-2 rounded-full bg-emerald-400 shrink-0 ${
                reducedMotion || !isIntersecting ? '' : 'animate-ping'
              }`}
            />
            <span className="truncate">{tBadgeHeader}</span>
          </div>
          <ShieldCheck className="h-3.5 w-3.5 text-[#8063F7] shrink-0 ml-1" />
        </div>

        {/* Identity Row: Avatar + Name + Title */}
        <div className="flex items-center gap-3 pt-3.5 pb-3">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-[#8063F7] via-[#4F6FF0] to-[#8063F7] shadow-md shadow-[#8063F7]/25">
            <div className="relative h-full w-full rounded-full overflow-hidden bg-[#101426] flex items-center justify-center">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-heading font-extrabold text-base sm:text-lg text-[#A995FF]">
                  GT
                </span>
              )}
            </div>
            {/* Status indicator pip */}
            <span className="absolute bottom-0 right-0 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-[#101426] bg-emerald-400" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="font-heading text-sm sm:text-base font-bold text-[#F5F6FC] truncate">
              {name}
            </h3>
            <p className="text-xs text-[#A995FF] font-medium truncate">
              {title}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-[#858EA8] truncate">
              <MapPin className="h-3 w-3 text-[#8063F7] shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Student Line: 4th-year Software Engineering Student @ ASTU */}
        <div className="my-2 flex items-center gap-2 rounded-lg border border-[#8063F7]/30 bg-[#8063F7]/10 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-[#C4B5FD]">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#8063F7]" />
          <span className="truncate">{tAcademicStudent}</span>
        </div>

        {/* Availability Status Pill */}
        <div className="mb-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="truncate font-medium">{status}</span>
        </div>

        {/* Quick Tech Chips */}
        <div className="flex flex-wrap gap-1.5 pb-3">
          {techChips.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-[#292D45] bg-[#171D32]/90 px-2 py-0.5 text-[10px] font-mono text-[#D0D4E4] transition-colors hover:border-[#8063F7]/50"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Bottom Barcode / Monospace Verification Code */}
        <div className="flex items-center justify-between border-t border-[#292D45]/70 pt-2 text-[10px] font-mono text-[#858EA8]">
          <span className="tracking-wider">{tBadgeIdCode}</span>
          {/* Decorative Security Barcode Stripes */}
          <div className="flex items-center gap-[2px] h-3 opacity-60" aria-hidden="true">
            <div className="w-[1.5px] h-full bg-[#8063F7]" />
            <div className="w-[3px] h-full bg-[#8063F7]" />
            <div className="w-[1px] h-full bg-[#8063F7]/50" />
            <div className="w-[2px] h-full bg-[#8063F7]" />
            <div className="w-[4px] h-full bg-[#8063F7]" />
            <div className="w-[1px] h-full bg-[#8063F7]/50" />
            <div className="w-[2.5px] h-full bg-[#8063F7]" />
            <div className="w-[1px] h-full bg-[#8063F7]" />
          </div>
        </div>
      </div>
    </div>
  );
}

