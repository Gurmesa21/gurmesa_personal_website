import Link from 'next/link';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import NotificationBell from '@/components/admin/NotificationBell';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });

export const metadata = {
  title: 'Admin Dashboard | Gurmesa',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`min-h-screen flex flex-col antialiased bg-background text-foreground font-sans w-full selection:bg-[#8063F7]/30 selection:text-white ${inter.variable} ${outfit.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="flex h-screen flex-col md:flex-row w-full bg-background text-foreground overflow-hidden">
            <aside className="w-full md:w-64 bg-[#0A0D1B] text-foreground p-6 shrink-0 overflow-y-auto border-r border-border flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h2 className="text-xl font-heading font-extrabold tracking-tight text-foreground">Admin Panel</h2>
                <NotificationBell />
              </div>
              <nav className="flex flex-col gap-1.5 font-medium">
                <Link href="/admin" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Dashboard</Link>
                <Link href="/admin/profile" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Profile</Link>
                <Link href="/admin/experience" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Experience</Link>
                <Link href="/admin/skills" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Skills</Link>
                <Link href="/admin/social-links" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Social Links</Link>
                <Link href="/admin/settings" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Settings</Link>
                <hr className="border-border my-2" />
                <Link href="/admin/services" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Services</Link>
                <Link href="/admin/projects" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Projects</Link>
                <Link href="/admin/blog" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Blog</Link>
                <Link href="/admin/comments" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Comments</Link>
                <Link href="/admin/technologies" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Technologies</Link>
                <Link href="/admin/media" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Media Library</Link>
                <hr className="border-border my-2" />
                <Link href="/admin/inquiries" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Inquiries</Link>
                <Link href="/admin/testimonials" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Testimonials</Link>
                <Link href="/admin/audit-log" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Audit Logs</Link>
              </nav>
            </aside>
            <main id="main-content" className="flex-1 p-6 md:p-10 min-w-0 overflow-y-auto bg-background text-foreground">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
