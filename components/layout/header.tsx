'use client'

import * as React from 'react'
import { Link, usePathname, useRouter } from '../../navigation'
import { Menu, X, Globe, ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
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
          <nav className="hidden lg:flex gap-1.5 lg:gap-3">
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

        <div className="hidden lg:flex items-center gap-3">
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
        <div className="flex flex-1 items-center justify-end lg:hidden gap-2">
          <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
            <DialogPrimitive.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 !p-0 text-[#F5F6FC] hover:bg-[#171D32]/60 focus-visible:bg-[#171D32]/60 focus-visible:ring-2 focus-visible:ring-[#8063F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B16] rounded-xl transition-all"
                aria-label={t('toggleMenu')}
                aria-expanded={isOpen}
                aria-controls="mobile-nav-panel"
              >
                <Menu className="h-6 w-6 shrink-0 text-[#F5F6FC]" stroke="currentColor" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
              />
              <DialogPrimitive.Content
                id="mobile-nav-panel"
                aria-modal="true"
                aria-label={t('toggleMenu')}
                className={cn(
                  "fixed top-0 right-0 z-50 h-[100vh] h-[100dvh] w-full max-w-[min(88vw,380px)]",
                  "flex flex-col justify-between overflow-x-hidden border-l border-[#292D45]",
                  "bg-gradient-to-b from-[#101426]/98 via-[#0A0D1D]/95 to-[#080B16]/98 backdrop-blur-xl shadow-2xl",
                  "pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] px-5 sm:px-6",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out",
                  "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
                  "duration-280 data-[state=closed]:duration-200 ease-out",
                  "motion-reduce:animate-none motion-reduce:transform-none"
                )}
              >
                <DialogPrimitive.Title className="sr-only">
                  Navigation Menu
                </DialogPrimitive.Title>

                {/* Top Row: Wordmark + Close Button */}
                <div className="flex items-center justify-between pb-4 border-b border-[#292D45]/40 shrink-0">
                  <span className="font-heading font-extrabold text-lg sm:text-xl inline-block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    AVENOR
                  </span>
                  <DialogPrimitive.Close
                    className="h-11 w-11 rounded-full border border-[#292D45] bg-[#101426] flex items-center justify-center text-[#F5F6FC] hover:bg-[#171D32] hover:text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8063F7]"
                    aria-label={t('closeMenu')}
                  >
                    <X className="h-5 w-5 shrink-0 text-[#F5F6FC]" />
                  </DialogPrimitive.Close>
                </div>

                {/* Navigation Links: min-height 56px, 20px semibold text, index, arrow */}
                <div className="flex-1 overflow-y-auto py-3 my-auto flex flex-col justify-center divide-y divide-[#292D45]/40">
                  {navKeys.map((key, index) => {
                    const isActive = pathname === `/${key}` || pathname.startsWith(`/${key}/`);
                    const indexStr = String(index + 1).padStart(2, '0');
                    return (
                      <Link
                        key={key}
                        href={`/${key}`}
                        onClick={() => setIsOpen(false)}
                        style={{ animationDelay: `${index * 40}ms` }}
                        className={cn(
                          "group relative flex items-center justify-between min-h-[56px] py-3.5 px-3.5 rounded-xl transition-all duration-200",
                          "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both motion-reduce:animate-none",
                          isActive
                            ? "text-white font-bold bg-[#171D32]/70 before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[#8063F7] before:to-[#4F6FF0] shadow-sm"
                            : "text-[#A5ABC1] hover:text-[#F5F6FC] hover:bg-[#171D32]/40",
                          "active:bg-[#8063F7]/15 active:scale-98"
                        )}
                      >
                        <div className="flex items-center min-w-0">
                          <span className="font-mono text-xs text-[#858EA8] mr-3 shrink-0">
                            {indexStr}
                          </span>
                          <span className="text-[20px] font-semibold tracking-tight truncate">
                            {t(key)}
                          </span>
                        </div>
                        <ArrowRight
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1",
                            isActive ? "text-[#8063F7]" : "text-[#858EA8]/70"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>

                {/* Language Switcher Segmented Control */}
                <div className="shrink-0 pt-2">
                  <div className="rounded-xl border border-[#292D45] bg-[#101426] p-1 flex items-center justify-between gap-1">
                    {langs.map((l) => {
                      const isCurrent = locale === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            changeLanguage(l.code);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all min-h-[40px] flex items-center justify-center",
                            isCurrent
                              ? "bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] text-white shadow-md font-bold"
                              : "text-[#A5ABC1] hover:text-[#F5F6FC] hover:bg-[#171D32]/60 active:scale-95"
                          )}
                        >
                          {l.code === 'en' ? 'EN' : l.code === 'am' ? 'አማ' : 'OM'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Call to Action */}
                <div className="shrink-0 pt-4 pb-1">
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8063F7] via-[#6F4FF2] to-[#4F6FF0] py-3 px-6 text-sm font-semibold text-white shadow-lg shadow-[#8063F7]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#8063F7]/50 active:scale-98 min-h-[48px]"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span>{t('contact')}</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </div>
      </div>
    </header>
  )
}
