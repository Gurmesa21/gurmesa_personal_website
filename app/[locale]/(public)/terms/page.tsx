import Link from 'next/link';
import { TestimonialList } from '@/components/testimonials/TestimonialList';

export const metadata = {
  title: 'Terms of Service - Gurmesa',
};

import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('Terms');
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose">
        <h1>{t('title')}</h1>
        <p>{t('updated')}</p>

        <h2>{t('h1')}</h2>
        <p>
          {t('p1')}
        </p>

        <h2>{t('h2')}</h2>
        <p>
          {t('p2')}
        </p>

        <h2>{t('h3')}</h2>
        <p>
          {t('p3')}
        </p>

        <h2>{t('h4')}</h2>
        <p>
          {t('p4')}
        </p>

        <h2>{t('h5')}</h2>
        <p>
          {t('p5')}
        </p>

        <h2>{t('h6')}</h2>
        <p>
          {t('p6_1')} <Link href="/contact">{t('p6_link')}</Link>{t('p6_2')}
        </p>
      </div>

      <TestimonialList />
    </div>
  );
}
