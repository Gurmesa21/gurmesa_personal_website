import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';


export const metadata = {
  title: 'Terms of Service - Gurmesa',
};

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 md:py-6">

      <div className="flex items-center justify-between pb-2 ">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#858EA8] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#292D45] bg-[#101426]">
            <FileText className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
            {t('title')}
          </span>
        </div>

        <h1 className="sr-only">
          {t('title')}
        </h1>
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
    </div>
  );
}
