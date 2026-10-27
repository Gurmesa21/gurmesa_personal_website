'use client';

import { useTransition } from 'react';
import { approveCommentAction, deleteCommentAction } from './actions';
import { Button } from '@/components/ui/button';
import type { BlogComment } from '@prisma/client';

export default function AdminComments({ comments, postId }: { comments: BlogComment[], postId: string }) {
  const [isPending, startTransition] = useTransition();

  if (!comments.length) {
    return (
      <div className="text-muted-foreground mt-8 p-6 text-center border border-dashed border-border rounded-xl">
        No comments yet for this post.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Comments ({comments.length})</h2>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-5 border rounded-xl shadow-sm bg-card border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div>
                <span className="font-semibold text-foreground">{comment.author}</span>
                <span className="text-xs text-muted-foreground ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                {comment.status === 'PENDING' && (
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
            <p className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed text-sm">{comment.content}</p>
            {comment.status === 'PENDING' && (
              <div className="mt-3 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 inline-block px-2.5 py-0.5 rounded-full">
                Pending Approval
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
