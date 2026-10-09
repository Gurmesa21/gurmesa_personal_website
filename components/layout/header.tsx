'use client'

import * as React from 'react'
import { Link, usePathname, useRouter } from '../../navigation'
import { Menu, Moon, Sun, Globe, ChevronDown } from 'lucide-react'
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
import { useTheme } from 'next-themes'

const navKeys = ['work', 'services', 'about', 'blog', 'contact', 'testimonials'] as const;

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLangOpen, setIsLangOpen] = React.useState(false)
  
  const { theme, setTheme } = useTheme()
  const t = useTranslations('Navigation')

  const tTheme = useTranslations('Theme')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-colors duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95 duration-200">
            <span className="font-heading font-extrabold text-lg sm:text-xl inline-block bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">AVENOR</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navKeys.map((key) => (
              <Link
                key={key}
                href={`/${key}`}
                className={cn(
                  "flex items-center text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-md",
                  pathname === `/${key}` && "text-foreground font-semibold bg-muted/50"
                )}
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 bg-card rounded-full border shadow-sm px-4 py-2 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium text-sm"
              aria-label="Select Language"
            >
              <Globe className="h-4 w-4 text-primary" />
              <span>{langs.find(l => l.code === locale)?.native}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isLangOpen && "rotate-180")} />
            </button>
            
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-primary",
                      locale === l.code ? "text-primary bg-primary/5" : "text-foreground"
                    )}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full shadow-sm hover:text-primary hover:border-primary/50 transition-all">
            {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">{tTheme('toggle')}</span>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="flex flex-1 items-center justify-end md:hidden gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-muted">
            {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
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
