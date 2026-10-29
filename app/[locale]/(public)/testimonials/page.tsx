import { TestimonialForm } from './TestimonialForm';
import { TestimonialList } from '@/components/testimonials/TestimonialList';
import { getTranslations } from 'next-intl/server';
import { testimonialService } from '@/server/services/testimonialService';
import { toPublicTestimonial } from '@/lib/dto/testimonial';
import { MessageSquareQuote, PenTool, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Testimonials - Gurmesa',
  description: 'What people say about me.'
};

export default async function TestimonialsPage() {
  const t = await getTranslations('Testimonials');

  const rawTestimonials = await testimonialService.getPublicTestimonials();
  const testimonials = rawTestimonials.map(toPublicTestimonial);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 space-y-8 min-w-0">
        <h1 className="sr-only">{t('title')}</h1>

        {/* Quick action bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#292D45]/60 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#858EA8] font-medium inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#292D45] bg-[#101426]">
              <Sparkles className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
              {testimonials.length} {testimonials.length === 1 ? 'Endorsement' : 'Endorsements'}
            </span>
          </div>
          <a
            href="#testimonial-form"
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#8063F7]/40 bg-[#8063F7]/10 text-xs font-semibold text-[#A995FF] hover:bg-[#8063F7]/20 transition-all ml-auto"
          >
            <PenTool className="w-3.5 h-3.5" />
            Leave Feedback
          </a>
        </div>

        {/* 2-Column Responsive Layout:
            - Left: Vertically stacked testimonial cards (lg:col-span-7)
            - Right: Fixed / Sticky submission form (lg:col-span-5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start min-w-0 ">
          {/* Left Column: Testimonial Cards stacked vertically */}
          <section className="lg:col-span-7 space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#A995FF] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />
                Client &amp; Collaborator Feedback
              </h2>
              <span className="text-xs text-[#858EA8]">
                {testimonials.length} {testimonials.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {testimonials.length > 0 ? (
              <TestimonialList testimonials={testimonials} />
            ) : (
              <div className="text-center text-[#A5ABC1] py-14 border border-dashed border-[#292D45] rounded-2xl bg-[#101426]/50 space-y-2">
                <MessageSquareQuote className="w-8 h-8 text-[#858EA8] mx-auto" />
                <p className="text-sm">{t('noTestimonials')}</p>
              </div>
            )}
          </section>

          {/* Right Column: Fixed / Sticky Testimonial Submission Form */}
          <aside
            id="testimonial-form"
            className="lg:col-span-5 min-w-0 lg:sticky lg:top-24 space-y-4"
          >
            <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-xl space-y-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              <div className="flex items-center justify-between pb-3.5 border-b border-[#292D45]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#8063F7]">
                    <PenTool className="w-3.5 h-3.5 animate-pulse" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold font-heading text-[#F5F6FC]">
                      {t('submitTitle')}
                    </h2>
                    <p className="text-xs text-[#858EA8]">Share your experience</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ">
                  Verified Feed
                </span>
              </div>

              <TestimonialForm />

              <div className="pt-3 border-t border-[#292D45]/60 flex items-start gap-2 text-[11px] text-[#858EA8] leading-tight">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8063F7] shrink-0 mt-0.5" />
                <span>
                  All submissions are reviewed before publishing to ensure authentic feedback. You may submit anonymously.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
