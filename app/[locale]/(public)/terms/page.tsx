import Link from 'next/link';
import { TestimonialList } from '@/components/testimonials/TestimonialList';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Gurmesa',
};

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8063F7]/30 bg-[#8063F7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
          <FileText className="h-3.5 w-3.5 text-[#8063F7]" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#F5F6FC]">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A5ABC1]">
          {t('updated')}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-8 md:p-10 shadow-xl transition-all duration-300 hover:border-[#8063F7]/70 hover:shadow-2xl hover:shadow-[#8063F7]/10">
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
        <div className="space-y-6 text-[#F5F6FC] [&>h2]:text-lg [&>h2]:sm:text-xl [&>h2]:font-bold [&>h2]:font-heading [&>h2]:text-[#F5F6FC] [&>h2]:pt-4 [&>h2]:border-t [&>h2]:border-[#292D45] [&>h2:first-child]:pt-0 [&>h2:first-child]:border-0 [&>p]:text-sm [&>p]:text-[#D0D4E4] [&>p]:leading-relaxed [&_strong]:text-[#F5F6FC] [&_strong]:font-semibold">
          <h2>{t('h1')}</h2>
          <p>{t('p1')}</p>

          <h2>{t('h2')}</h2>
          <p>{t('p2')}</p>

          <h2>{t('h3')}</h2>
          <p>{t('p3')}</p>

          <h2>{t('h4')}</h2>
          <p>{t('p4')}</p>

          <h2>{t('h5')}</h2>
          <p>{t('p5')}</p>

          <h2>{t('h6')}</h2>
          <p>
            {t('p6_1')} <Link href="/contact" className="text-[#A995FF] hover:underline font-semibold">{t('p6_link')}</Link>{t('p6_2')}
          </p>
        </div>
      </div>

      {/* Testimonials List */}
      <section className="pt-6 border-t border-[#292D45]">
        <TestimonialList />
      </section>
    </div>
  );
}
