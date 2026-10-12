import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { TestimonialList } from '@/components/testimonials/TestimonialList';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Privacy Policy - Gurmesa',
};

import { getTranslations } from 'next-intl/server';

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
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose">
        <h1>{t('title')}</h1>
        <p>{t('updated')}</p>

        <h2>{t('h1')}</h2>
        <p>
          {t('p1_1')}
        </p>
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
        <p>
          {t('p2_1')}
        </p>
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
        <p>
          {t('p4_1')}
        </p>

        <h2>{t('h5')}</h2>
        <p>
          {t('p5_1')} <Link href="/contact">{t('p5_link')}</Link>{t('p5_2')}
        </p>
      </div>

      <TestimonialList />
    </div>
  );
}
