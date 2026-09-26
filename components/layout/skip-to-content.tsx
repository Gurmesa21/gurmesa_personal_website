
import { cn } from '../../lib/utils'

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className={cn(
        "fixed left-4 top-4 z-50 -translate-y-24 transition-transform focus:translate-y-0",
        "bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      Skip to main content
    </a>
  )
}
