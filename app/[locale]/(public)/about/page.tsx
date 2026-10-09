
import {
  getPublicProfile,
  getPublicExperiences,
  getPublicSkills,
  getPublicSocialLinks
} from '@/server/services/profileService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

import { User } from 'lucide-react';
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
    avatarMedia = { url: profile.avatarUrl, mimeType: 'image/jpeg', altText: profile?.name || 'Avatar' };
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
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
      {/* Header & Bio (Social Media Style Profile Card) */}
      <section className="animated-container relative w-full mb-12 p-0">
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 h-48 sm:h-64 w-full relative">
          {/* Abstract background pattern for banner */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background"></div>
        </div>
        
        <div className="px-6 pb-8 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-24 mb-6 gap-6">
            <div className="shrink-0 rounded-full overflow-hidden w-32 h-32 sm:w-48 sm:h-48 relative border-4 sm:border-8 border-card dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-md z-10">
              {avatarMedia ? (
                <MediaRenderer url={avatarMedia.url} mimeType={avatarMedia.mimeType} altText={profile?.name || 'Avatar'} fill className="object-cover" />
              ) : (
                <User className="w-16 h-16 sm:w-24 sm:h-24 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 items-center z-10 pb-2">
              {socialLinks.map(link => (
                <Button key={link.id} variant="outline" size="sm" asChild className="rounded-full shadow-sm hover:shadow transition-all">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </Button>
              ))}
              {resumeUrl && (
                <Button asChild size="sm" className="rounded-full shadow-sm">
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">{t('downloadResume')}</a>
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{profile?.name || t('title')}</h1>
              <p className="text-primary text-lg font-medium mb-3">{profile?.title}</p>
              {(profile?.locationLabel || profile?.availabilityStatus) && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                  {profile?.locationLabel && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {profile.locationLabel}
                    </span>
                  )}
                  {profile?.availabilityStatus && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {profile.availabilityStatus}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p className="whitespace-pre-wrap">{profile?.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">{t('experience')}</h2>
        <div className="space-y-12 relative before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-border">
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="relative flex items-start justify-start md:justify-center group">
              {/* Node Marker */}
              <div className="absolute left-5 md:left-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 -translate-x-1/2 z-10 top-2">
                <span className="text-sm font-bold">{idx + 1}</span>
              </div>
              {/* Card Container */}
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ml-16 md:ml-0 ${idx % 2 === 0 ? 'md:pr-12 md:mr-auto' : 'md:pl-12 md:ml-auto'}`}>
                <Card className="animated-card">
                  <CardHeader>
                    <CardTitle className="text-card-title">{exp.role}</CardTitle>
                    <div className="text-sm font-medium text-primary">{exp.organization}</div>
                    <div className="text-caption mt-1">
                      {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : t('present')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{exp.description}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">{t('skills')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(skillsByCategory).map(([category, catSkills]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold capitalize border-b pb-2">{category.replace('_', ' ')}</h3>
              <div className="flex flex-wrap gap-2">
                {catSkills.map(skill => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name} {skill.proficiencyLabel && <span className="opacity-70 ml-1 text-xs">({skill.proficiencyLabel})</span>}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
