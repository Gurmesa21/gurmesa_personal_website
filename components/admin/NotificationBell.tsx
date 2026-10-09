import Link from 'next/link';
import { Bell } from 'lucide-react';
import { prisma } from '@/server/repositories/db';

export default async function NotificationBell() {
  const unreadCount = await prisma.notification.count({
    where: { isRead: false }
  });

  return (
    <Link href="/admin/notifications" className="relative p-2 rounded-full hover:bg-slate-800 transition-colors">
      <Bell className="w-6 h-6 text-slate-300" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
