import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminComments } from '@/server/services/blogService';
import { CommentsQueueClient } from './CommentsQueueClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { CommentStatus } from '@prisma/client';

export const metadata = {
  title: 'Comments Moderation | Admin',
};

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }

  const resolvedParams = await searchParams;
  const currentFilter = (resolvedParams.status?.toUpperCase() || 'PENDING') as 'ALL' | CommentStatus;

  const validStatuses: ('ALL' | CommentStatus)[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  const activeStatus = validStatuses.includes(currentFilter) ? currentFilter : 'PENDING';

  const comments = await getAdminComments(activeStatus === 'ALL' ? undefined : activeStatus);

  const serializedComments = comments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    moderatedAt: c.moderatedAt ? c.moderatedAt.toISOString() : null,
  }));

  const filterTabs: { label: string; value: 'ALL' | CommentStatus }[] = [
    { label: 'Pending Review', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All Comments', value: 'ALL' },
  ];

  return (
    <div className="space-y-8 p-8 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comment Moderation</h1>
          <p className="text-slate-500 mt-1">Review, approve, reject, and manage reader comments.</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {filterTabs.map((tab) => {
          const isActive = activeStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/comments?status=${tab.value}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {activeStatus === 'ALL' ? 'All Comments' : `${activeStatus} Comments`} ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CommentsQueueClient comments={serializedComments} />
        </CardContent>
      </Card>
    </div>
  );
}
