'use client';

import { useState, useRef, useEffect } from 'react';
import { submitContactForm } from './actions';

export function ContactForm() {
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
        setErrorSummary(result.error || 'Submission failed');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    } catch {
      setErrorSummary('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="p-6 bg-green-50 text-green-900 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
        <p>Your inquiry has been received. We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {errorSummary && (
        <div 
          ref={errorRef}
          tabIndex={-1}
          className="p-4 bg-red-50 text-red-900 rounded-lg shadow-sm border border-red-200 outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          role="alert"
        >
          <h2 className="text-base font-semibold mb-1">Please fix the following errors:</h2>
          <p>{errorSummary}</p>
        </div>
      )}

      {/* Honeypot */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="honeypot">Leave this empty</label>
        <input type="text" id="honeypot" name="honeypot" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          maxLength={100}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {fieldErrors.name && <p id="name-error" className="text-sm text-red-600">{fieldErrors.name.join(', ')}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          maxLength={254}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {fieldErrors.email && <p id="email-error" className="text-sm text-red-600">{fieldErrors.email.join(', ')}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700">Organization (Optional)</label>
        <input 
          type="text" 
          id="organization" 
          name="organization" 
          maxLength={150}
          aria-invalid={!!fieldErrors.organization}
          aria-describedby={fieldErrors.organization ? "organization-error" : undefined}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {fieldErrors.organization && <p id="organization-error" className="text-sm text-red-600">{fieldErrors.organization.join(', ')}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">Project Type</label>
        <select 
          id="projectType" 
          name="projectType"
          aria-invalid={!!fieldErrors.projectType}
          aria-describedby={fieldErrors.projectType ? "projectType-error" : undefined}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">Select a project type...</option>
          <option value="Business website">Business website</option>
          <option value="Internal system">Internal system</option>
          <option value="Dashboard">Dashboard</option>
          <option value="Automation">Automation</option>
          <option value="API/Integration">API/Integration</option>
          <option value="Other">Other</option>
        </select>
        {fieldErrors.projectType && <p id="projectType-error" className="text-sm text-red-600">{fieldErrors.projectType.join(', ')}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
        <div className="text-xs text-gray-500 mb-1" id="message-hint">Please describe your project or inquiry (10-5000 characters).</div>
        <textarea 
          id="message" 
          name="message" 
          required 
          minLength={10}
          maxLength={5000}
          rows={5}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={`message-hint ${fieldErrors.message ? "message-error" : ""}`}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {fieldErrors.message && <p id="message-error" className="text-sm text-red-600">{fieldErrors.message.join(', ')}</p>}
      </div>

      <div className="text-sm text-gray-600">
        By submitting this form, you acknowledge our <a href="/privacy" className="text-blue-600 underline hover:no-underline">Privacy Policy</a>.
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
