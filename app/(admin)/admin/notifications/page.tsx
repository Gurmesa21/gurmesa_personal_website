import { prisma } from '@/server/repositories/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { markAsRead, markAllAsRead } from './actions';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <form action={markAllAsRead}>
            <Button type="submit" variant="outline">Mark All as Read</Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-slate-500">No notifications yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map(n => {
            const linkHref = n.type === 'NEW_INQUIRY' 
              ? `/admin/inquiries/${n.entityId}`
              : n.type === 'NEW_TESTIMONIAL'
              ? `/admin/testimonials/${n.entityId}`
              : n.type === 'NEW_COMMENT'
              ? '/admin/comments'
              : '#';

            return (
              <div key={n.id} className={`p-4 border rounded-lg flex justify-between items-center ${!n.isRead ? 'bg-slate-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-medium">{n.message}</p>
                  <p className="text-sm text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={linkHref}>
                    <Button variant="secondary" size="sm">View</Button>
                  </Link>
                  {!n.isRead && (
                    <form action={markAsRead.bind(null, n.id)}>
                      <Button type="submit" variant="outline" size="sm">Mark Read</Button>
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
