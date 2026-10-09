import { type PublicTestimonial } from '@/lib/dto/testimonial';
import { testimonialService } from '@/server/services/testimonialService';
import { toPublicTestimonial } from '@/lib/dto/testimonial';

interface TestimonialListProps {
  testimonials?: PublicTestimonial[];
}

export async function TestimonialList({ testimonials }: TestimonialListProps = {}) {
  if (!testimonials) {
    const rawTestimonials = await testimonialService.getPublicTestimonials();
    testimonials = rawTestimonials.map(toPublicTestimonial);
  }

  if (testimonials.length === 0) return null;

  return (
    <div className="mt-12 bg-gray-50 dark:bg-slate-900 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <blockquote className="text-gray-700 dark:text-gray-300 italic mb-4">&quot;{testimonial.content}&quot;</blockquote>
            <div className="border-t dark:border-slate-700 pt-4">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name || 'Anonymous'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {testimonial.role} {testimonial.organization && `at ${testimonial.organization}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
