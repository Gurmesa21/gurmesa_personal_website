import { Link } from '../../navigation'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('Footer')
  const tNav = await getTranslations('Navigation')
  return (
    <footer className="border-t border-border bg-blue-50 dark:bg-slate-950 py-6 md:py-0 transition-colors">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-8">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm font-medium leading-loose text-slate-600 dark:text-slate-400 md:text-left">
            &copy; {new Date().getFullYear()} Gurmesa Teklemariam. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/testimonials" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">{tNav('testimonials')}</Link>
          <Link href="/privacy" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">{t('privacy')}</Link>
          <Link href="/terms" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">{t('terms')}</Link>
        </div>
      </div>
    </footer>
  )
}
