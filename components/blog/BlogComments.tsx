'use client';

import { useState } from 'react';
import { addComment } from '@/app/actions/blog';
import { Button } from '@/components/ui/button';
import { User, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface BlogCommentsProps {
  postId: string;
  initialComments: Comment[];
}

export function BlogComments({ postId, initialComments }: BlogCommentsProps) {
  const [comments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('Blog');

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      setError(t('nameRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSubmitSuccess(false);

    const result = await addComment(postId, { author, content });
    
    if (result.success) {
      setSubmitSuccess(true);
      setAuthor('');
      setContent('');
    } else {
      setError(result.error || t('failedToComment'));
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="comments" className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          {t('commentsTitle')} ({comments.length})
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-12 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h4 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{t('leaveComment')}</h4>
        {error && <div className="text-rose-500 text-sm mb-4">{error}</div>}
        {submitSuccess && <div className="text-emerald-500 text-sm mb-4">Your comment has been submitted for moderation.</div>}
        
        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder={t('yourName')} 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <textarea 
              placeholder={t('yourThoughts')} 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="rounded-full px-8">
            {isSubmitting ? t('posting') : t('postComment')}
          </Button>
        </div>
      </form>

      <div className="space-y-8">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {t('noComments')}
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{comment.author}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
