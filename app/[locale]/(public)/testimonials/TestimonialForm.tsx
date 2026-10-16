'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { submitTestimonialForm } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function TestimonialForm() {
  const t = useTranslations('Testimonials');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    try {
      const res = await submitTestimonialForm(formData);
      if (res.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(res.error || t('formError'));
      }
    } catch {
      setStatus('error');
      setErrorMessage(t('formError'));
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[#0E2A1E] p-6 sm:p-8 rounded-2xl border border-emerald-500/30 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-xl sm:text-2xl font-bold text-emerald-300 font-heading">{t('successTitle')}</h3>
        <p className="text-sm text-emerald-200/90 max-w-md mx-auto">{t('successMessage')}</p>
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => setStatus('idle')}
            className="text-xs border-[#292D45] bg-[#171D32] text-[#F5F6FC] hover:bg-[#8063F7] hover:border-[#8063F7] hover:text-white h-9 px-4 rounded-lg"
          >
            {t('submitAnother')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Website (leave blank)</label>
        <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <div className="bg-red-50 dark:bg-[#2A1520] p-4 rounded-xl flex items-start gap-3 border border-red-200 dark:border-[#FF5C8A]/30">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-[#FF5C8A] shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-[#FF9EBC]">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
          {t('nameLabel')}
        </label>
        <Input
          id="name"
          name="name"
          required
          placeholder={t('namePlaceholder')}
          className="h-11 bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="organization" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
            {t('orgLabel')} <span className="text-[#858EA8] font-normal">({t('optional')})</span>
          </label>
          <Input
            id="organization"
            name="organization"
            placeholder={t('orgPlaceholder')}
            className="h-11 bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
            {t('roleLabel')} <span className="text-[#858EA8] font-normal">({t('optional')})</span>
          </label>
          <Input
            id="role"
            name="role"
            placeholder={t('rolePlaceholder')}
            className="h-11 bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="text" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">
          {t('textLabel')}
        </label>
        <Textarea
          id="text"
          name="text"
          required
          rows={4}
          placeholder={t('textPlaceholder')}
          className="bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
        />
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          id="isAnonymous"
          name="isAnonymous"
          className="rounded border-[#292D45] bg-[#171D32] text-[#8063F7] w-4 h-4 focus:ring-[#8063F7]"
        />
        <label htmlFor="isAnonymous" className="text-xs text-[#A5ABC1]">
          {t('anonymousLabel')}
        </label>
      </div>

      <div className="flex justify-center pt-1">
        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full sm:w-auto font-semibold px-7 h-11 rounded-lg bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] hover:from-[#7154e6] hover:to-[#3e5edb] text-white shadow-md active:scale-95 transition-all"
        >
          {status === 'submitting' ? t('submitting') : t('submitButton')}
        </Button>
      </div>
    </form>
  );
}
