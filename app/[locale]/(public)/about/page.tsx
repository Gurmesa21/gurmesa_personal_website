
export const dynamic = 'force-dynamic';

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

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { User, Download, Sparkles, ArrowRight } from 'lucide-react';
import { MediaRenderer } from '@/components/ui/MediaRenderer';

export default async function AboutPage() {
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 space-y-8 sm:space-y-10">
        {/* Compact eyebrow header aligned with content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">

            <span className="inline-flex items-center gap-2 rounded-full border border-[#292D45] bg-[#171D32] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A995FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8063F7] animate-pulse" />

              {t('title')}
            </span>
          </div>
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
              <div className="relative w-48 h-48 md:w-full md:h-auto max-w-[280px] sm:max-w-[320px] md:max-w-none aspect-[3/4] rounded-2xl overflow-hidden border border-[#8063F7]/40 bg-[#171D32] shadow-2xl shadow-black/50 group-hover:border-[#8063F7]/70 group-hover:shadow-[0_12px_36px_rgba(128,99,247,0.2)] transition-all duration-500 flex items-center justify-center">
                {avatarMedia ? (
                  <MediaRenderer
                    url={avatarMedia.url}
                    mimeType={avatarMedia.mimeType}
                    altText={profile?.name || 'Avatar'}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#171D32] to-[#101426]">
                    <User className="w-20 h-20 text-[#8063F7]/70" />
                  </div>
                )}
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

                <h1 className="sr-only">
                  {profile?.name || t('title')}
                </h1>

                {/* Biography */}
                {profile?.bio && (
                  <p className="text-sm sm:text-base text-[#A5ABC1] leading-relaxed font-normal whitespace-pre-wrap max-w-3xl">
                    {profile.bio}
                  </p>
                )}

                {/* Actions row: Social Links + Resume Download */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                  {socialLinks.map(link => (
                    <Button
                      key={link.id}
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-xl border-[#292D45] bg-[#171D32]/80 text-[#D0D4E4] hover:border-[#8063F7]/60 hover:bg-[#1f2642] hover:text-white transition-all duration-200 text-xs h-9 px-3.5 shadow-sm active:scale-95"
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label || link.platform}
                      </a>
                    </Button>
                  ))}
                  {resumeUrl && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl border-0 bg-gradient-to-r from-[#8063F7] to-[#4F6FF0] text-white hover:from-[#7154e6] hover:to-[#3e5edb] text-xs h-9 px-4 font-semibold shadow-md shadow-[#8063F7]/25 hover:shadow-[#8063F7]/40 active:scale-95 transition-all duration-200 inline-flex items-center gap-1.5"
                    >
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('downloadResume')}</span>
                      </a>
                    </Button>
                  )}
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
