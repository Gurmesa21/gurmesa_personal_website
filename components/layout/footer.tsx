import { Link } from '../../navigation'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('Footer')
  const tNav = await getTranslations('Navigation')
  return (
    <footer className="border-t border-[#292D45] bg-[#080B16] text-[#F5F6FC] py-5 md:py-0 transition-colors">
      <div className="container max-w-7xl mx-auto flex flex-col items-center justify-between gap-3 md:h-16 md:flex-row px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 md:flex-row md:px-0">
          <p className="text-center text-xs sm:text-sm font-medium text-[#A5ABC1] md:text-left">
            &copy; {new Date().getFullYear()} Gurmesa Teklemariam. {t('rights')}
          </p>
        </div>
        <div className="flex gap-5 items-center">
          <Link href="/testimonials" className="text-xs sm:text-sm font-medium text-[#A5ABC1] hover:text-[#F5F6FC] transition-colors">{tNav('testimonials')}</Link>
          <Link href="/privacy" className="text-xs sm:text-sm font-medium text-[#A5ABC1] hover:text-[#F5F6FC] transition-colors">{t('privacy')}</Link>
          <Link href="/terms" className="text-xs sm:text-sm font-medium text-[#A5ABC1] hover:text-[#F5F6FC] transition-colors">{t('terms')}</Link>
        </div>
      </div>
    </footer>
  )
}
