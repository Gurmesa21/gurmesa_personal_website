import Link from 'next/link';

import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
        {t('description')}
      </p>
      <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
        {t('returnHome')}
      </Link>
    </div>
  );
}
