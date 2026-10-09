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
      <div className="p-6 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
        <h2 className="text-xl font-bold mb-2">{t('successTitle')}</h2>
        <p className="font-medium">{t('successMessage')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {errorSummary && (
        <div 
          ref={errorRef}
          tabIndex={-1}
          className="p-4 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100 rounded-lg shadow-sm border border-red-200 dark:border-red-800 outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          role="alert"
        >
          <h2 className="text-base font-semibold mb-1">{t('errorTitle')}</h2>
          <p>{errorSummary}</p>
        </div>
      )}

      {/* Honeypot */}
      <div aria-hidden="true" className="hidden">
        <Label htmlFor="honeypot">{t('leaveEmpty')}</Label>
        <Input type="text" id="honeypot" name="honeypot" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <Input 
            type="text" 
            id="name" 
            name="name" 
            required 
            maxLength={100}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {fieldErrors.name && <p id="name-error" className="text-sm text-red-600">{fieldErrors.name.join(', ')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('emailLabel')}</Label>
          <Input 
            type="email" 
            id="email" 
            name="email" 
            required 
            maxLength={254}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && <p id="email-error" className="text-sm text-red-600">{fieldErrors.email.join(', ')}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="organization">{t('organization')}</Label>
          <Input 
            type="text" 
            id="organization" 
            name="organization" 
            maxLength={150}
            aria-invalid={!!fieldErrors.organization}
            aria-describedby={fieldErrors.organization ? "organization-error" : undefined}
          />
          {fieldErrors.organization && <p id="organization-error" className="text-sm text-red-600">{fieldErrors.organization.join(', ')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectType">{t('projectType')}</Label>
          <select 
            id="projectType" 
            name="projectType"
            aria-invalid={!!fieldErrors.projectType}
            aria-describedby={fieldErrors.projectType ? "projectType-error" : undefined}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{t('selectProjectType')}</option>
            <option value="Business website">{t('typeBusiness')}</option>
            <option value="Internal system">{t('typeInternal')}</option>
            <option value="Dashboard">{t('typeDashboard')}</option>
            <option value="Automation">{t('typeAutomation')}</option>
            <option value="API/Integration">{t('typeAPI')}</option>
            <option value="Other">{t('typeOther')}</option>
          </select>
          {fieldErrors.projectType && <p id="projectType-error" className="text-sm text-red-600">{fieldErrors.projectType.join(', ')}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t('message')}</Label>
        <div className="text-xs text-muted-foreground mb-1" id="message-hint">{t('messageHint')}</div>
        <Textarea 
          id="message" 
          name="message" 
          required 
          minLength={10}
          maxLength={5000}
          rows={6}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={`message-hint ${fieldErrors.message ? "message-error" : ""}`}
        />
        {fieldErrors.message && <p id="message-error" className="text-sm text-red-600">{fieldErrors.message.join(', ')}</p>}
      </div>

      <div className="text-sm text-muted-foreground text-center">
        {t('privacyPrefix')} <Link href="/privacy" className="text-primary underline hover:no-underline">{t('privacyLink')}</Link>.
      </div>

      <div className="flex justify-center pt-2">
        <Button 
          type="submit" 
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto font-bold px-12"
        >
          {isSubmitting ? t('sending') : t('sendMessage')}
        </Button>
      </div>
    </form>
  );
}
