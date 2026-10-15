import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { TestimonialList } from '@/components/testimonials/TestimonialList';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck } from 'lucide-react';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Privacy Policy - Gurmesa',
};

export default async function PrivacyPage() {
  const t = await getTranslations('Privacy');
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'inquiryRetentionDays' } });
  
  let retentionDays = 365;
  if (setting && setting.value) {
    try {
      retentionDays = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch {
      retentionDays = Number(setting.value) || 365;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8063F7]/30 bg-[#8063F7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#8063F7]" />
          <span>Legal & Compliance</span>
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
        <div className="prose prose-invert max-w-none text-[#F5F6FC] prose-headings:font-heading prose-headings:text-[#F5F6FC] prose-headings:font-bold prose-headings:tracking-tight prose-p:text-[#A5ABC1] prose-p:leading-relaxed prose-li:text-[#A5ABC1] prose-strong:text-[#F5F6FC] prose-a:text-[#A995FF] hover:prose-a:text-white">
          <h2>{t('h1')}</h2>
          <p>{t('p1_1')}</p>
          <ul>
            <li>{t('li1')}</li>
            <li>{t('li2')}</li>
            <li>{t('li3')}</li>
            <li>{t('li4')}</li>
            <li>{t('li5')}</li>
            <li>{t('li_likes')}</li>
            <li>{t('li_comments')}</li>
          </ul>
          <p>
            {t('p1_2')} <strong>{t('p1_strong')}</strong>{t('p1_3')}
          </p>

          <h2>{t('h2')}</h2>
          <p>{t('p2_1')}</p>
          <ul>
            <li>{t('li6')}</li>
            <li>{t('li7')}</li>
            <li>{t('li8')}</li>
          </ul>

          <h2>{t('h3')}</h2>
          <p>
            {t('p3_1')} <strong>{t('p3_strong', { days: retentionDays })}</strong>{t('p3_2')}
          </p>

          <h2>{t('h4')}</h2>
          <p>{t('p4_1')}</p>

          <h2>{t('h5')}</h2>
          <p>
            {t('p5_1')} <Link href="/contact" className="text-[#A995FF] hover:underline font-semibold">{t('p5_link')}</Link>{t('p5_2')}
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
