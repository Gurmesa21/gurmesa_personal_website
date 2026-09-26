
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-8">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Gurmesa. The source code is available on{' '}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
