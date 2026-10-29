import Link from 'next/link';

import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
      <h1 className="sr-only">{t('title')}</h1>
      <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
        {t('returnHome')}
      </Link>
    </div>
  );
}
