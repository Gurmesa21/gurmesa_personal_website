import Link from 'next/link';
import NotificationBell from '@/components/admin/NotificationBell';
import '../globals.css';

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen flex-col md:flex-row w-full bg-background text-foreground overflow-hidden">
          <aside className="w-full md:w-64 bg-slate-900 text-white p-6 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
              <NotificationBell />
            </div>
            <nav className="flex flex-col gap-3 font-medium">
              <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/admin/profile" className="hover:text-primary transition-colors">Profile</Link>
              <Link href="/admin/experience" className="hover:text-primary transition-colors">Experience</Link>
              <Link href="/admin/skills" className="hover:text-primary transition-colors">Skills</Link>
              <Link href="/admin/social-links" className="hover:text-primary transition-colors">Social Links</Link>
              <Link href="/admin/settings" className="hover:text-primary transition-colors">Settings</Link>
              <hr className="border-slate-700 my-2" />
              <Link href="/admin/services" className="hover:text-primary transition-colors">Services</Link>
              <Link href="/admin/projects" className="hover:text-primary transition-colors">Projects</Link>
              <Link href="/admin/blog" className="hover:text-primary transition-colors">Blog</Link>
              <Link href="/admin/technologies" className="hover:text-primary transition-colors">Technologies</Link>
              <hr className="border-slate-700 my-2" />
              <Link href="/admin/inquiries" className="hover:text-primary transition-colors">Inquiries</Link>
              <Link href="/admin/testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
            </nav>
          </aside>
          <main id="main-content" className="flex-1 p-8 md:p-12 min-w-0 overflow-y-auto">

            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
