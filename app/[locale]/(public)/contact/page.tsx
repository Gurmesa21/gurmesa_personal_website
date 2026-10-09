import { PrismaClient } from '@prisma/client';
import { ContactForm } from './ContactForm';
import { TestimonialList } from '@/components/testimonials/TestimonialList';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const prisma = new PrismaClient();

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

  let publicEmail = 'contact@example.com';
  if (emailSetting?.value) {
    try {
      publicEmail = JSON.parse(emailSetting.value as string);
    } catch {
      publicEmail = emailSetting.value as string;
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
      
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Direct Contact Banner */}
      <section className="animated-container">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardContent className="p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold">{t('directContact')}</h2>
            
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">{t('email')}</span>
              </div>
              <a href={`mailto:${publicEmail}`} className="text-xl text-primary hover:underline font-bold">
                {publicEmail}
              </a>
            </div>

            {socialLinks.length > 0 && (
              <div className="pt-6 border-t border-primary/10">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">{t('connect')}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {socialLinks.map(link => (
                    <Button key={link.id} variant="outline" size="sm" asChild className="rounded-full bg-background">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label || link.platform}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Contact Form Section */}
      <section className="animated-container max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center">{t('sendAMessage')}</h2>
        <Card className="border shadow-sm p-6 md:p-8">
          <ContactForm />
        </Card>
      </section>
      
      {/* Testimonials */}
      <section className="pt-12 border-t animated-container">
        <TestimonialList />
      </section>
    </div>
  );
}
