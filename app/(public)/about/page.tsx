
import {
  getPublicProfile,
  getPublicExperiences,
  getPublicSkills,
  getPublicSocialLinks
} from '../../../server/services/profileService';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
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

export default async function AboutPage() {
  const [profile, experiences, skills, socialLinks, resumeUrl] = await Promise.all([
    getPublicProfile(),
    getPublicExperiences(),
    getPublicSkills(),
    getPublicSocialLinks(),
    getResumeUrl()
  ]);

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
      {/* Header & Bio */}
      <section className="space-y-6">
        <h1 className="text-4xl font-bold">About Me</h1>
        <div className="flex flex-wrap gap-4 items-center pb-4">
          {socialLinks.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              {link.label}
            </a>
          ))}
          {resumeUrl && (
            <Button variant="outline" asChild>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">Download Resume</a>
            </Button>
          )}
        </div>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{profile?.bio}</p>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Experience</h2>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="text-sm font-bold">{idx + 1}</span>
              </div>
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{exp.role}</CardTitle>
                  <div className="text-sm font-medium text-primary">{exp.organization}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{exp.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Skills & Expertise</h2>
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
