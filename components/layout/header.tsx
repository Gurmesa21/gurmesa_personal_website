'use client'

import * as React from 'react'
import { Link, usePathname, useRouter } from '../../navigation'
import { Menu, Globe, ChevronDown, ArrowUpRight } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { cn } from '../../lib/utils'
import { useTranslations, useLocale } from 'next-intl'

const navKeys = ['work', 'services', 'about', 'blog', 'contact', 'testimonials'] as const;

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLangOpen, setIsLangOpen] = React.useState(false)
  
  const t = useTranslations('Navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  
  const langRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langRef]);

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setIsLangOpen(false);
  }

  const isHomePage = pathname === '/' || pathname === '';

  const langs = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'am', label: 'Amharic', native: 'አማርኛ' },
    { code: 'om', label: 'Oromo', native: 'Oromiffa' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-200 border-b border-[#292D45] bg-[#080B16]/90 text-[#F5F6FC] supports-[backdrop-filter]:bg-[#080B16]/80">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95 duration-200">
            <span className="font-heading font-extrabold text-lg sm:text-xl inline-block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">AVENOR</span>
          </Link>
          <nav className="hidden md:flex gap-1.5 lg:gap-3">
            {navKeys.map((key) => {
              const isActive = pathname === `/${key}` || pathname.startsWith(`/${key}/`);
              return (
                <Link
                  key={key}
                  href={`/${key}`}
                  className={cn(
                    "flex items-center text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg",
                    isActive
                      ? "text-[#F5F6FC] font-semibold bg-[#171D32]"
                      : "text-[#A5ABC1] hover:text-[#F5F6FC] hover:bg-[#171D32]/60"
                  )}
                >
                  {t(key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 rounded-full border border-[#292D45] bg-[#101426] text-[#F5F6FC] shadow-sm px-3.5 py-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#8063F7] hover:border-[#8063F7]/50 font-medium text-xs sm:text-sm"
              aria-label="Select Language"
            >
              <Globe className="h-4 w-4 text-[#8063F7]" />
              <span>{langs.find(l => l.code === locale)?.native}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200 text-[#A5ABC1]", isLangOpen && "rotate-180")} />
            </button>
            
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 border border-[#292D45] bg-[#101426]">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-xs sm:text-sm font-medium transition-colors",
                      locale === l.code
                        ? "text-[#A995FF] bg-[#8063F7]/10 font-semibold"
                        : "text-[#F5F6FC] hover:bg-[#171D32] hover:text-[#A995FF]"
                    )}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/contact"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8063F7]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#8063F7]/50 active:scale-95"
          >
            {/* Shimmer sweep animation */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

            {/* Glowing active indicator dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span>{t('contact')}</span>

            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="flex flex-1 items-center justify-end md:hidden gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className={cn("px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0", isHomePage && "text-[#F5F6FC]")}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-xl border bg-card">
              <DialogHeader>
                <DialogTitle className="font-heading">Navigation</DialogTitle>
              </DialogHeader>
              <nav className="flex flex-col gap-4 mt-4">
                {navKeys.map((key) => (
                  <Link
                    key={key}
                    href={`/${key}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-lg font-medium hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                  >
                    {t(key)}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <div className="px-3">
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">Language</label>
                  <div className="grid grid-cols-1 gap-2">
                    {langs.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { changeLanguage(l.code); setIsOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors border",
                          locale === l.code ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-muted text-foreground"
                        )}
                      >
                        {l.native}
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
