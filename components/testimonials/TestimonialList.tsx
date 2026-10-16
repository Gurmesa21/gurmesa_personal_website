import { type PublicTestimonial } from '@/lib/dto/testimonial';
import { testimonialService } from '@/server/services/testimonialService';
import { toPublicTestimonial } from '@/lib/dto/testimonial';
import { Quote, CheckCircle2 } from 'lucide-react';

interface TestimonialListProps {
  testimonials?: PublicTestimonial[];
}

export async function TestimonialList({ testimonials }: TestimonialListProps = {}) {
  if (!testimonials) {
    const rawTestimonials = await testimonialService.getPublicTestimonials();
    testimonials = rawTestimonials.map(toPublicTestimonial);
  }

  if (testimonials.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full min-w-0">
      {testimonials.map((testimonial, idx) => (
        <article
          key={testimonial.id}
          className="group relative w-full min-w-0 max-w-full rounded-2xl border border-[#292D45] bg-[#101426] p-5 sm:p-7 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 flex flex-col justify-between space-y-4 overflow-hidden"
        >
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
          {/* Subtle ambient light glow on hover */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#8063F7]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top row: Author profile + Verified Badge */}
          <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-[#8063F7]/40 bg-gradient-to-br from-[#8063F7]/25 to-[#171D32] flex items-center justify-center text-sm font-bold text-[#A995FF] shrink-0 shadow-inner">
                {(testimonial.name || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#F5F6FC] break-words">
                    {testimonial.name || 'Anonymous Client'}
                  </h3>
                  {idx === 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#A995FF] shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#858EA8] break-words">
                  {(testimonial.role || testimonial.organization)
                    ? `${testimonial.role || ''}${testimonial.organization ? (testimonial.role ? ` at ${testimonial.organization}` : testimonial.organization) : ''}`
                    : 'Verified Client Endorsement'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
              <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-[#8063F7]/30 group-hover:text-[#8063F7]/70 transition-colors" />
            </div>
          </div>

          {/* Middle: The Quote itself with proper word wrapping */}
          <blockquote className="text-base sm:text-lg text-[#F5F6FC] font-medium italic leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] pt-1">
            &ldquo;{testimonial.content}&rdquo;
          </blockquote>

          {/* Bottom row: Review metadata */}
          <div className="pt-3 border-t border-[#292D45]/60 flex items-center justify-between text-xs text-[#858EA8] min-w-0">
            <span className="flex items-center gap-1.5 text-[11px] text-[#A5ABC1]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Direct Client Review
            </span>
            <div className="flex items-center gap-1 text-[#8063F7] text-xs font-semibold tracking-wider">
              ★★★★★
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
