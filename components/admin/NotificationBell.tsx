import Link from 'next/link';
import { Bell } from 'lucide-react';
import { prisma } from '@/server/repositories/db';

export default async function NotificationBell() {
  let unreadCount = 0;
  try {
    unreadCount = await prisma.notification.count({
      where: { isRead: false }
    });
  } catch (error) {
    // Graceful fallback to 0 if database is offline or reconnecting
    unreadCount = 0;
  }

  return (
    <Link href="/admin/notifications" className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Notifications">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-red-600 bg-destructive rounded-full shadow-sm animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
