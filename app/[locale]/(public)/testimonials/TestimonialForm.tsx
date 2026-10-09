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
    } catch (err) {
      setStatus('error');
      setErrorMessage(t('formError'));
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
        <h3 className="text-xl font-bold text-green-900">{t('successTitle')}</h3>
        <p className="text-green-800">{t('successMessage')}</p>
        <Button variant="outline" onClick={() => setStatus('idle')} className="mt-4">
          {t('submitAnother')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot field - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">Website (leave blank)</label>
        <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">{t('nameLabel')}</label>
        <Input id="name" name="name" required placeholder={t('namePlaceholder')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="organization" className="text-sm font-medium">{t('orgLabel')} <span className="text-muted-foreground font-normal">({t('optional')})</span></label>
          <Input id="organization" name="organization" placeholder={t('orgPlaceholder')} />
        </div>
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">{t('roleLabel')} <span className="text-muted-foreground font-normal">({t('optional')})</span></label>
          <Input id="role" name="role" placeholder={t('rolePlaceholder')} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="text" className="text-sm font-medium">{t('textLabel')}</label>
        <Textarea id="text" name="text" required rows={5} placeholder={t('textPlaceholder')} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isAnonymous" name="isAnonymous" className="rounded border-gray-300 w-4 h-4" />
        <label htmlFor="isAnonymous" className="text-sm text-gray-700 dark:text-gray-300">
          {t('anonymousLabel')}
        </label>
      </div>

      <Button type="submit" disabled={status === 'submitting'} className="w-full sm:w-auto">
        {status === 'submitting' ? t('submitting') : t('submitButton')}
      </Button>
    </form>
  );
}
