'use client';

import { useState, useRef, useEffect } from 'react';
import { submitContactForm } from './actions';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function ContactForm() {
  const t = useTranslations('Contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorSummary && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errorSummary]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorSummary(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('source', window.location.pathname);
    const pathname = window.location.pathname;
    const locale = pathname.startsWith('/am') ? 'am' : (pathname.startsWith('/om') ? 'om' : 'en');
    formData.set('locale', locale);

    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setErrorSummary(result.error || t('submissionFailed'));
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    } catch {
      setErrorSummary(t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="p-6 sm:p-8 bg-[#0E2A1E] text-emerald-200 rounded-2xl border border-emerald-500/30 text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-300 font-heading">{t('successTitle')}</h2>
        <p className="text-sm text-emerald-200/90 leading-relaxed max-w-md mx-auto">{t('successMessage')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errorSummary && (
        <div
          ref={errorRef}
          tabIndex={-1}
          className="bg-red-50 dark:bg-[#2A1520] p-4 text-[#991B1B] dark:text-[#FF9EBC] rounded-xl border border-red-200 dark:border-[#FF5C8A]/30 outline-none focus:ring-2 focus:ring-[#8063F7]"
          role="alert"
        >
          <h2 className="text-sm font-semibold mb-1 text-red-800 dark:text-[#FF5C8A] font-heading">{t('errorTitle')}</h2>
          <p className="text-xs text-red-700 dark:text-[#FF9EBC]">{errorSummary}</p>
        </div>
      )}

      {/* Honeypot */}
      <div aria-hidden="true" className="hidden">
        <Label htmlFor="honeypot">{t('leaveEmpty')}</Label>
        <Input type="text" id="honeypot" name="honeypot" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">{t('name')}</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            maxLength={100}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className="h-11 bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
          />
          {fieldErrors.name && <p id="name-error" className="text-xs text-[#FF5C8A] mt-1">{fieldErrors.name.join(', ')}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">{t('emailLabel')}</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            maxLength={254}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="h-11 bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
          />
          {fieldErrors.email && <p id="email-error" className="text-xs text-[#FF5C8A] mt-1">{fieldErrors.email.join(', ')}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="organization" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">{t('organization')}</Label>
          <Input
            type="text"
            id="organization"
            name="organization"
            maxLength={150}
            aria-invalid={!!fieldErrors.organization}
            aria-describedby={fieldErrors.organization ? "organization-error" : undefined}
            className="h-11 bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
          />
          {fieldErrors.organization && <p id="organization-error" className="text-xs text-[#FF5C8A] mt-1">{fieldErrors.organization.join(', ')}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="projectType" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">{t('projectType')}</Label>
          <select
            id="projectType"
            name="projectType"
            aria-invalid={!!fieldErrors.projectType}
            aria-describedby={fieldErrors.projectType ? "projectType-error" : undefined}
            className="flex h-11 w-full items-center justify-between rounded-lg border border-[#292D45] bg-[#171D32] px-3.5 py-2 text-sm text-[#F5F6FC] focus:outline-none focus:border-[#8063F7] focus:ring-1 focus:ring-[#8063F7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" className="bg-[#101426] text-[#858EA8]">{t('selectProjectType')}</option>
            <option value="Business website" className="bg-[#101426] text-[#F5F6FC]">{t('typeBusiness')}</option>
            <option value="Internal system" className="bg-[#101426] text-[#F5F6FC]">{t('typeInternal')}</option>
            <option value="Dashboard" className="bg-[#101426] text-[#F5F6FC]">{t('typeDashboard')}</option>
            <option value="Automation" className="bg-[#101426] text-[#F5F6FC]">{t('typeAutomation')}</option>
            <option value="API/Integration" className="bg-[#101426] text-[#F5F6FC]">{t('typeAPI')}</option>
            <option value="Other" className="bg-[#101426] text-[#F5F6FC]">{t('typeOther')}</option>
          </select>
          {fieldErrors.projectType && <p id="projectType-error" className="text-xs text-[#FF5C8A] mt-1">{fieldErrors.projectType.join(', ')}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-[#A5ABC1]">{t('message')}</Label>
        <div className="text-xs text-[#858EA8] mb-1" id="message-hint">{t('messageHint')}</div>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={`message-hint ${fieldErrors.message ? "message-error" : ""}`}
          className="bg-[#171D32] border-[#292D45] text-[#F5F6FC] placeholder:text-[#858EA8] focus-visible:border-[#8063F7] focus-visible:ring-[#8063F7] rounded-lg"
        />
        {fieldErrors.message && <p id="message-error" className="text-xs text-[#FF5C8A] mt-1">{fieldErrors.message.join(', ')}</p>}
      </div>

      <div className="text-xs text-[#858EA8] text-center">
        {t('privacyPrefix')}{' '}
        <Link href="/privacy" className="text-[#A995FF] hover:underline font-medium">
          {t('privacyLink')}
        </Link>.
      </div>

      <div className="flex justify-center pt-1">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto font-semibold px-8 h-11 rounded-lg bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] hover:from-[#7154e6] hover:to-[#3e5edb] text-white shadow-md active:scale-95 transition-all"
        >
          {isSubmitting ? t('sending') : t('sendMessage')}
        </Button>
      </div>
    </form>
  );
}
