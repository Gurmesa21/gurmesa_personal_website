import { prisma } from '@/server/repositories/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { markAsRead, markAllAsRead } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Notifications | Admin' };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-foreground">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System alerts, incoming inquiries, reader comments, and new testimonials.
          </p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <form action={markAllAsRead}>
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="bg-card border-border py-16 text-center">
          <CardContent className="space-y-3">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-base font-semibold text-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You are all caught up! When visitors submit inquiries, leave comments, or post testimonials, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(n => {
            const linkHref = n.type === 'NEW_INQUIRY' 
              ? `/admin/inquiries/${n.entityId}`
              : n.type === 'NEW_TESTIMONIAL'
              ? `/admin/testimonials/${n.entityId}`
              : n.type === 'NEW_COMMENT'
              ? '/admin/comments'
              : '#';

            const isUnread = !n.isRead;

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUnread
                    ? 'bg-card border-primary/40 shadow-sm relative overflow-hidden pl-5 sm:pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-primary'
                    : 'bg-card/50 border-border/70 hover:bg-card hover:border-border transition-colors'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium ${isUnread ? 'text-foreground font-semibold' : 'text-foreground/80'}`}>
                      {n.message}
                    </p>
                    {isUnread && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={linkHref}>View</Link>
                  </Button>
                  {isUnread && (
                    <form action={markAsRead.bind(null, n.id)}>
                      <Button type="submit" variant="outline" size="sm">
                        Mark Read
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
