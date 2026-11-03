
export const revalidate = 3600;
export const dynamic = 'auto';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'am' }, { locale: 'om' }];
}

import {
  getPublicProfile,
  getPublicExperiences,
  getPublicSkills,
  getPublicSocialLinks
} from '@/server/services/profileService';
import { Button } from '@/components/ui/button';
import { getSeoOverride } from '@/server/services/seoService';
import { getResumeUrl } from '@/server/services/mediaService';
import { Metadata } from 'next';
import { isTestMode } from '@/lib/test-mode';
import { unstable_noStore as noStore } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { User, Download, Sparkles, ArrowRight, ArrowUpRight, Mail, Globe } from 'lucide-react';
import { MediaRenderer } from '@/components/ui/MediaRenderer';

function getSocialInfo(platform: string, label?: string) {
  const p = (platform || '').toLowerCase().trim();
  if (p.includes('github')) return { name: 'GitHub', icon: 'github' };
  if (p.includes('linkedin')) return { name: 'LinkedIn', icon: 'linkedin' };
  if (p.includes('twitter') || p === 'x') return { name: 'X (Twitter)', icon: 'twitter' };
  if (p.includes('email') || p.includes('mail')) return { name: 'Email', icon: 'email' };
  return { name: label || platform || 'Link', icon: 'link' };
}

function SocialIcon({ type }: { type: string }) {
  switch (type) {
    case 'github':
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'email':
      return <Mail className="w-3.5 h-3.5" />;
    default:
      return <Globe className="w-3.5 h-3.5" />;
  }
}
export async function generateMetadata(): Promise<Metadata> {
  const override = await getSeoOverride('/about');
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  return {
    title: override?.title || 'About',
    description: override?.description || 'About me.',
    alternates: { canonical: override?.canonical || `${siteUrl}/about` },
    openGraph: {
      title: override?.title || 'About',
      description: override?.description || 'About me.',
      url: `${siteUrl}/about`,
      images: override?.ogImage ? [override.ogImage.storageKey] : ['/og-image.jpg'],
    }
  };
}

export default async function AboutPage() {
  if (isTestMode()) {
    noStore();
  }
  const t = await getTranslations('About');
  const [profile, experiences, skills, socialLinks, resumeUrl] = await Promise.all([
    getPublicProfile(),
    getPublicExperiences(),
    getPublicSkills(),
    getPublicSocialLinks(),
    getResumeUrl()
  ]);

  let avatarMedia = null;
  if (profile?.avatarUrl) {
    const isVideo = profile.avatarUrl.endsWith('.mp4') || profile.avatarUrl.endsWith('.webm');
    avatarMedia = { url: profile.avatarUrl, mimeType: isVideo ? 'video/mp4' : 'image/jpeg', altText: profile?.name || 'Avatar' };
  }

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080B16] text-[#F5F6FC] selection:bg-[#8063F7]/30 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8063F7]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#4F6FF0]/10 rounded-full blur-[120px]" />
      </div>


      {/* Compact eyebrow header aligned with content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 md:py-6">

        <div className="flex items-center justify-between pb-2 ">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#858EA8] font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#292D45] bg-[#101426]">
              <User className="w-3.5 h-3.5 text-[#8063F7] animate-pulse" />
              {t('title')}
            </span>
          </div>

          <h1 className="sr-only">
            {t('title')}
          </h1>
        </div>

        {/* Profile Hero Card: Cinematic profile composition with vertical image on left and text on right */}
        <section className="group relative overflow-hidden rounded-2xl border border-[#292D45] bg-[#101426] p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-[0_20px_50px_rgba(128,99,247,0.12)]">
          {/* Thin Top Accent Line Animation */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8063F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
          <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#8063F7]/15 blur-3xl group-hover:scale-125 transition-transform duration-700 ease-out" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#4F6FF0]/15 blur-3xl group-hover:scale-125 transition-transform duration-700 ease-out" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Cinematic Profile Visual on Left (Vertical Composition) */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center justify-center">
              <div
                data-testid="about-profile-card"
                className="relative w-48 h-48 rounded-2xl overflow-hidden border border-[#8063F7]/40 bg-[#080B16] shadow-2xl shadow-black/50 group-hover:border-[#8063F7]/70 group-hover:shadow-[0_12px_36px_rgba(128,99,247,0.2)] transition-all duration-500 flex items-center justify-center p-1"
              >
                {/* Inner 9:16 vertical frame centered horizontally & vertically */}
                <div
                  data-testid="profile-image-frame-9-16"
                  className="relative h-full aspect-[9/16] max-h-full flex items-center justify-center overflow-hidden bg-[#080B16]"
                >
                  {avatarMedia ? (
                    <MediaRenderer
                      url={avatarMedia.url}
                      mimeType={avatarMedia.mimeType}
                      altText={profile?.name || 'Avatar'}
                      fill
                      className="object-contain object-cover [object-fit:contain_!important]"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#171D32] to-[#101426]">
                      <span className="font-heading font-extrabold text-2xl text-[#8063F7]">GT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content on Right */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-6 text-center md:text-left">
              <div className="space-y-4">
                {/* Header Pills: Role & Clean Availability Status */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#8063F7]/30 bg-[#8063F7]/10 text-[#A995FF]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />
                    Full-Stack Engineer & Architect
                  </span>

                  {profile?.availabilityStatus && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 backdrop-blur-sm transition-colors hover:bg-emerald-500/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span className="tracking-wide font-medium">{profile.availabilityStatus}</span>
                    </span>
                  )}
                </div>





                {/* Biography */}
                {profile?.bio && (
                  <p className="text-sm sm:text-base text-[#A5ABC1] leading-relaxed font-normal whitespace-pre-wrap max-w-3xl">
                    {profile.bio}
                  </p>
                )}

                {/* Social Links: vertically stacked (one per line) with full readable names and icons */}
                <div className="w-full space-y-2 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#858EA8] text-left">
                    Connect & Profiles
                  </div>
                  <div className="flex flex-col items-start gap-2 w-full">
                    {socialLinks.map((link) => {
                      const info = getSocialInfo(link.platform, link.label);
                      const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          aria-label={info.name}
                          className="inline-flex items-center gap-3 w-auto max-w-full px-3.5 py-2.5 rounded-xl border border-[#292D45] bg-[#171D32]/80 text-[#D0D4E4] hover:border-[#8063F7]/70 hover:bg-[#1f2642] hover:text-[#F5F6FC] hover:shadow-md hover:shadow-[#8063F7]/10 focus:outline-none focus:ring-2 focus:ring-[#8063F7] focus:ring-offset-2 focus:ring-offset-[#101426] transition-all duration-200 text-xs sm:text-sm font-medium group"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#8063F7]/30 bg-[#101426] text-[#A995FF] group-hover:text-white group-hover:border-[#8063F7]/60 transition-colors">
                            <SocialIcon type={info.icon} />
                          </span>
                          <span className="truncate">{info.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#858EA8] group-hover:text-[#A995FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1.5" />
                        </a>
                      );
                    })}

                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('downloadResume')}
                        className="inline-flex items-center justify-center gap-2 w-auto max-w-full px-4 py-2.5 rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] text-white hover:from-[#7154e6] hover:to-[#3e5edb] text-xs sm:text-sm font-semibold shadow-md shadow-[#8063F7]/25 hover:shadow-[#8063F7]/40 focus:outline-none focus:ring-2 focus:ring-[#8063F7] focus:ring-offset-2 focus:ring-offset-[#101426] active:scale-95 transition-all duration-200 mt-1"
                      >
                        <Download className="w-4 h-4 shrink-0" />
                        <span>{t('downloadResume')}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Incorporated Collaboration Block (moved from bottom banner) */}
              <div className="mt-2 rounded-xl border border-[#292D45] bg-gradient-to-r from-[#171D32]/90 via-[#13182C]/80 to-[#171D32]/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md transition-all duration-300 hover:border-[#8063F7]/60 hover:shadow-lg hover:shadow-[#8063F7]/10">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8063F7]/15 text-[#8063F7]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <h3 className="text-sm sm:text-base font-heading font-bold text-[#F5F6FC]">
                      Interested in collaborating on a project?
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed">
                    Available for full-stack development, architectural reviews, and technical consulting.
                  </p>
                </div>
                <Button
                  asChild
                  className="shrink-0 rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] hover:from-[#7154e6] hover:to-[#3e5edb] text-white text-xs sm:text-sm font-semibold h-10 px-5 shadow-md shadow-[#8063F7]/30 hover:shadow-[#8063F7]/50 active:scale-95 transition-all duration-200 group/btn"
                >
                  <Link href="/contact" className="inline-flex items-center gap-2">
                    <span>Contact Me</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Experience and Skills Grid: balanced two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Experience Timeline (7 cols) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#8063F7]" />
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#F5F6FC]">
                {t('experience')}
              </h2>
            </div>

            <div className="rounded-2xl  p-6 sm:p-7  border border-[#292D45] bg-[#101426]  transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 overflow-hidden ">
              <div className="relative pl-6 sm:pl-7 border-l-2 border-[#292D45] space-y-6 sm:space-y-8 my-1">
                {experiences.map(exp => (
                  <div key={exp.id} className="group relative ">

                    {/* Node marker on the timeline */}
                    <div className="absolute -left-[31px] sm:-left-[35px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#8063F7] bg-[#101426] group-hover:bg-[#8063F7] group-hover:scale-125 transition-all duration-300" />

                    <div className="space-y-1.5 ">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <h3 className="font-heading text-base sm:text-lg font-bold text-[#F5F6FC] group-hover:text-[#A995FF] transition-colors">
                          {exp.role}
                        </h3>
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#171D32] border border-[#292D45] text-[#858EA8] shrink-0 w-fit">
                          {new Date(exp.startDate).getFullYear()} – {exp.endDate ? new Date(exp.endDate).getFullYear() : t('present')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#A995FF]">
                        {exp.organization}
                      </p>
                      {exp.description && (
                        <p className="text-xs sm:text-sm text-[#A5ABC1] leading-relaxed whitespace-pre-wrap pt-1 border-b border-[#292D45]/70">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Skills and Expertise (5 cols) */}
          <section className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#4F6FF0]" />
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#F5F6FC]">
                {t('skills')}
              </h2>
            </div>

            <div className="rounded-2xl border border-[#292D45] bg-[#101426]  transition-all duration-300 hover:-translate-y-1 hover:border-[#8063F7]/70 hover:shadow-xl hover:shadow-[#8063F7]/10 overflow-hidden ] p-6 sm:p-7 shadow-xl space-y-5">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category} className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#292D45]/70">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A995FF] capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                    <span className="text-[11px] font-mono text-[#858EA8]">
                      {catSkills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map(skill => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border border-[#292D45] bg-[#171D32] text-[#F5F6FC] hover:border-[#8063F7]/50 hover:bg-[#1f2642] transition-colors"
                      >
                        {skill.name}
                        {skill.proficiencyLabel && (
                          <span className="text-[#858EA8] ml-1 text-[11px] font-mono">
                            · {skill.proficiencyLabel}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
