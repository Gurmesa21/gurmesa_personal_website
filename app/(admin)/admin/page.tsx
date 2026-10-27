import Link from 'next/link';
import { auth, signOut } from '../../../auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, LogOut, Briefcase, Code2, PenTool, LayoutTemplate, MessageSquare, Inbox, FolderOpen, ShieldCheck } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  const sections = [
    { href: '/admin/projects', title: 'Manage Projects & Case Studies', icon: Briefcase, desc: 'Portfolio and case study entries' },
    { href: '/admin/technologies', title: 'Manage Technologies', icon: Code2, desc: 'Tech stack tags and skills' },
    { href: '/admin/blog', title: 'Manage Blog Posts', icon: PenTool, desc: 'Articles and writings' },
    { href: '/admin/comments', title: 'Moderate Comments', icon: MessageSquare, desc: 'Review and approve reader comments' },
    { href: '/admin/services', title: 'Manage Services', icon: LayoutTemplate, desc: 'Service offerings' },
    { href: '/admin/testimonials', title: 'Manage Testimonials', icon: MessageSquare, desc: 'Client reviews and feedback' },
    { href: '/admin/inquiries', title: 'Manage Inquiries', icon: Inbox, desc: 'Contact form submissions' },
    { href: '/admin/media', title: 'Media Library', icon: FolderOpen, desc: 'Centralized assets and uploads' },
    { href: '/admin/audit-log', title: 'Audit Logs', icon: ShieldCheck, desc: 'Track administrative actions and security events' },
  ];

  return (
    <div className="container mx-auto p-8 max-w-6xl space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-4 text-foreground">
            <LayoutDashboard className="h-10 w-10 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Logged in as {session.user?.email}</p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/admin/login' });
          }}
        >
          <Button variant="outline" type="submit" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.href} className="animated-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  {section.title}
                </CardTitle>
                <CardDescription className="text-base pt-2">{section.desc}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Button variant="secondary" asChild className="w-full">
                  <Link href={section.href}>   Manage {section.title.split(' ').slice(1).join(' ')}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
