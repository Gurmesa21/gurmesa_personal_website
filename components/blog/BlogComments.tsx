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
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('Blog');

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !email.trim() || !content.trim()) {
      setError(t('fieldsRequired') || 'Name, email, and comment are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSubmitSuccess(false);

    const result = await addComment(postId, { author, email, content, honeypot });
    
    if (result.success) {
      setSubmitSuccess(true);
      setAuthor('');
      setEmail('');
      setContent('');
      setHoneypot('');
    } else {
      setError(result.error || t('failedToComment'));
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="comments" className="mt-10 pt-8 border-t border-[#292D45]">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#8063F7]">
          <MessageCircle className="w-4 h-4" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#F5F6FC]">
          {t('commentsTitle')} ({comments.length})
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-10 bg-[#101426] p-5 sm:p-6 rounded-2xl border border-[#292D45]">
        <h4 className="text-base font-semibold mb-3 text-[#F5F6FC]">{t('leaveComment')}</h4>
        {error && <div className="text-[#FF5C8A] text-sm mb-4" role="alert">{error}</div>}
        {submitSuccess && (
          <div className="text-emerald-400 text-sm mb-4" role="status">
            {t('commentSubmittedForReview') || 'Your comment has been submitted and will appear after review.'}
          </div>
        )}
        
        {/* Honeypot field */}
        <input 
          type="text" 
          name="website" 
          value={honeypot} 
          onChange={(e) => setHoneypot(e.target.value)} 
          tabIndex={-1} 
          autoComplete="off" 
          style={{ display: 'none' }} 
          aria-hidden="true" 
        />

        <div className="space-y-4">
          <div>
            <label htmlFor="comment-author" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#A5ABC1]">{t('yourName')}</label>
            <input 
              id="comment-author"
              type="text" 
              placeholder={t('yourName')} 
              aria-label={t('yourName')}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-[#171D32] border border-[#292D45] rounded-xl px-4 py-2.5 text-sm text-[#F5F6FC] placeholder:text-[#A5ABC1]/50 focus:outline-none focus:border-[#8063F7] focus:ring-1 focus:ring-[#8063F7] transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#A5ABC1]">{t('yourEmail') || 'Your Email'}</label>
            <input 
              id="comment-email"
              type="email" 
              placeholder={t('yourEmail') || 'Your Email'} 
              aria-label={t('yourEmail') || 'Your Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#171D32] border border-[#292D45] rounded-xl px-4 py-2.5 text-sm text-[#F5F6FC] placeholder:text-[#A5ABC1]/50 focus:outline-none focus:border-[#8063F7] focus:ring-1 focus:ring-[#8063F7] transition-colors"
              required
            />
            <p className="text-xs text-[#A5ABC1] mt-1">{t('emailNeverPublished') || 'Your email is private and will never be published.'}</p>
          </div>
          <div>
            <label htmlFor="comment-content" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#A5ABC1]">{t('yourThoughts')}</label>
            <textarea 
              id="comment-content"
              placeholder={t('yourThoughts')} 
              aria-label={t('yourThoughts')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-[#171D32] border border-[#292D45] rounded-xl px-4 py-2.5 text-sm text-[#F5F6FC] placeholder:text-[#A5ABC1]/50 focus:outline-none focus:border-[#8063F7] focus:ring-1 focus:ring-[#8063F7] transition-colors resize-none"
              required
            />
          </div>
          <p className="text-xs text-[#A5ABC1]">
            {t('commentModerationNotice') || 'Comments are moderated and will appear publicly once approved.'}
          </p>
          <Button type="submit" disabled={isSubmitting} className="rounded-xl px-6 py-2 h-auto text-sm font-semibold bg-[#6A4BE4] hover:bg-[#8063F7] text-white transition-colors">
            {isSubmitting ? t('posting') : t('postComment')}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-[#A5ABC1] border border-dashed border-[#292D45] rounded-xl">
            {t('noComments')}
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3.5 p-4 rounded-xl border border-[#292D45] bg-[#101426]">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-[#171D32] border border-[#292D45] flex items-center justify-center text-[#8063F7] mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#F5F6FC]">{comment.author}</span>
                  <span className="text-xs text-[#A5ABC1]">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-[#A5ABC1] leading-relaxed">
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
