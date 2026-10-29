import { prisma } from '@/server/repositories/db';
import { ContactForm } from './ContactForm';
import { getTranslations } from 'next-intl/server';

import { Mail, Share2, MessageSquare, ArrowUpRight, Clock, ShieldCheck, Code2, MailBadge } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Contact - Gurmesa',
  description: 'Get in touch for project inquiries or technical consulting.'
};

export default async function ContactPage() {
  const t = await getTranslations('Contact');
  const [emailSetting, socialLinks] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: 'publicContactEmail' } }),
    prisma.socialLink.findMany({ where: { visibility: 'PUBLIC' }, orderBy: { order: 'asc' } })

  ]);

  let publicEmail: string | null = null;
  if (emailSetting?.value) {
    try {
      const parsed = JSON.parse(emailSetting.value as string);
      publicEmail = typeof parsed === 'string' ? parsed : String(emailSetting.value);
    } catch {
      publicEmail = String(emailSetting.value);
    }
    publicEmail = publicEmail.replace(/^["']|["']$/g, '').trim();
    if (!publicEmail || !publicEmail.includes('@')) {
      publicEmail = null;
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 md:py-6">

        <div className="flex items-center justify-between pb-2 ">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#858EA8] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#292D45] bg-[#101426]">
              <MailBadge className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
              {t('title')}
            </span>
          </div>

          <h1 className="sr-only">
            {t('title')}
          </h1>
        </div>
        {/* Main Content Grid: Balanced two-column desktop layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Contact information & Socials (5 cols) */}
          <aside className="lg:col-span-5 space-y-5">
            <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-7 shadow-xl space-y-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#292D45]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#8063F7]">
                    <Mail className="w-4 h-4 animate-pulse" />
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-[#F5F6FC]">
                    {t('directContact')}
                  </h2>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border border-[#292D45] bg-[#171D32] hover:border-[#8063F7]/40 transition-colors mt-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#858EA8] block">
                    {t('email')}
                  </span>
                  {publicEmail ? (
                    <a
                      href={`mailto:${publicEmail}`}
                      className="text-sm sm:text-base font-semibold text-[#A995FF] hover:text-white transition-colors break-all block"
                    >
                      {publicEmail}
                    </a>
                  ) : (
                    <p className="text-xs sm:text-sm text-[#A5ABC1]">
                      Available via inquiry form on this page.
                    </p>
                  )}
                </div>
              </div>

              {/* Response Expectations Card */}
              <div className="p-4 rounded-xl border border-[#292D45]/70 bg-[#171D32]/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#858EA8]">
                  <Clock className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
                  <span>Response Time</span>
                </div>
                <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed">
                  I typically respond to new project inquiries and technical consulting requests within 24–48 hours on business days.
                </p>
              </div>

              {/* Social Profiles */}
              {socialLinks.length > 0 && (
                <div className="pt-4 border-t border-[#292D45] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#858EA8]">
                    <Share2 className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
                    <span>{t('connect')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {socialLinks.map(link => (
                      <Button
                        key={link.id}
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full justify-start rounded-lg h-9 px-3.5 text-xs border-[#292D45] bg-[#171D32] text-[#F5F6FC] hover:border-[#8063F7]/50 hover:bg-[#1f2642] hover:text-white transition-all"
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full">
                          <span className="truncate">{link.label || link.platform}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#858EA8] animate-pulse" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Column: Contact Message Form (7 cols) */}
          <section className="lg:col-span-7">
            <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-8 shadow-xl space-y-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#292D45]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#8063F7]">
                  <MessageSquare className="w-4 h-4 animate-pulse" />
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-[#F5F6FC]">
                    {t('sendAMessage')}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#858EA8]">
                    Share your requirements to explore project feasibility, timelines, and deliverables.
                  </p>
                </div>
              </div>

              <ContactForm />
            </div>
          </section>
        </div>

        {/* Supporting Details Row: Working arrangements & Scope */}
        <section className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-5 space-y-2 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
                <Code2 className="w-4 h-4 text-[#8063F7] animate-pulse" />
                <span>Project Scope</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed">
                Full-stack web applications, scalable architectures, responsive interfaces, and API integrations.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-5 space-y-2 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
                <Clock className="w-4 h-4 text-[#8063F7] animate-pulse" />
                <span>Working Arrangement</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed">
                Available for remote contract work worldwide with flexible communication and clear milestone updates.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-5 space-y-2 transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
                <ShieldCheck className="w-4 h-4 text-[#8063F7] animate-pulse" />
                <span>Advisory & Audits</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed">
                Technical evaluations, performance audits, security hygiene reviews, and refactoring strategies.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
