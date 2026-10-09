import { TestimonialForm } from './TestimonialForm';
import { TestimonialList } from '@/components/testimonials/TestimonialList';
import { getTranslations } from 'next-intl/server';
import { testimonialService } from '@/server/services/testimonialService';
import { toPublicTestimonial } from '@/lib/dto/testimonial';

export const metadata = {
  title: 'Testimonials - Gurmesa',
  description: 'What people say about me.'
};

export default async function TestimonialsPage() {
  const t = await getTranslations('Testimonials');
  
  const rawTestimonials = await testimonialService.getPublicTestimonials();
  const testimonials = rawTestimonials.map(toPublicTestimonial);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 sm:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {testimonials.length > 0 ? (
        <div className="mb-24">
          <TestimonialList testimonials={testimonials} />
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          {t('noTestimonials')}
        </div>
      )}

      <div className="animated-container max-w-2xl mx-auto overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">{t('submitTitle')}</h2>
          <TestimonialForm />
        </div>
      </div>
    </div>
  );
}
