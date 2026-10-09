'use client';

import { useTransition } from 'react';
import { approveCommentAction, deleteCommentAction } from './actions';
import { Button } from '@/components/ui/button';
import type { BlogComment } from '@prisma/client';

export default function AdminComments({ comments, postId }: { comments: BlogComment[], postId: string }) {
  const [isPending, startTransition] = useTransition();

  if (!comments.length) {
    return <div className="text-slate-500 mt-8">No comments yet.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 border rounded shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold">{comment.author}</span>
                <span className="text-sm text-slate-500 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                {!comment.isApproved && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={isPending}
                    onClick={() => startTransition(() => approveCommentAction(comment.id, postId))}
                  >
                    Approve
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="destructive" 
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteCommentAction(comment.id, postId))}
                >
                  Delete
                </Button>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
            {!comment.isApproved && (
              <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded">
                Pending Approval
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
