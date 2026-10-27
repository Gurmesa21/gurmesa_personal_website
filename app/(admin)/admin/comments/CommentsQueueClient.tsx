'use client';

import { useTransition } from 'react';
import { approveCommentAction, rejectCommentAction, deleteCommentAction } from './actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AdminCommentItem {
  id: string;
  author: string;
  authorEmail: string | null;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  moderatedAt: string | null;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export function CommentsQueueClient({ comments }: { comments: AdminCommentItem[] }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveCommentAction(id);
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      await rejectCommentAction(id);
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this comment permanently?')) {
      startTransition(async () => {
        await deleteCommentAction(id);
      });
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No comments found in this queue.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium text-xs uppercase tracking-wider">
          <tr>
            <th className="p-4">Author</th>
            <th className="p-4">Post</th>
            <th className="p-4">Comment</th>
            <th className="p-4">Status</th>
            <th className="p-4">Date</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {comments.map((comment) => (
            <tr 
              key={comment.id} 
              data-testid="comment-row" 
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="p-4 align-top">
                <div className="font-semibold text-foreground">{comment.author}</div>
                {comment.authorEmail && (
                  <div className="text-xs text-muted-foreground">{comment.authorEmail}</div>
                )}
              </td>
              <td className="p-4 align-top max-w-xs">
                <Link 
                  href={`/blog/${comment.post.slug}`} 
                  target="_blank" 
                  className="font-medium text-primary hover:underline line-clamp-2"
                >
                  {comment.post.title}
                </Link>
              </td>
              <td className="p-4 align-top max-w-md">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </td>
              <td className="p-4 align-top">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  comment.status === 'APPROVED' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : comment.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                }`}>
                  {comment.status}
                </span>
              </td>
              <td className="p-4 align-top text-xs text-slate-500 whitespace-nowrap">
                <div>Created: {new Date(comment.createdAt).toLocaleDateString()}</div>
                {comment.moderatedAt && (
                  <div>Moderated: {new Date(comment.moderatedAt).toLocaleDateString()}</div>
                )}
              </td>
              <td className="p-4 align-top text-right space-x-2 whitespace-nowrap">
                {comment.status !== 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="approve-btn"
                    disabled={isPending}
                    onClick={() => handleApprove(comment.id)}
                    className="text-emerald-600 hover:text-emerald-700 border-emerald-300"
                  >
                    Approve
                  </Button>
                )}
                {comment.status !== 'REJECTED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="reject-btn"
                    disabled={isPending}
                    onClick={() => handleReject(comment.id)}
                    className="text-amber-600 hover:text-amber-700 border-amber-300"
                  >
                    Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  data-testid="delete-btn"
                  disabled={isPending}
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
