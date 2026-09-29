import { testimonialService } from '@/server/services/testimonialService';
import { toPublicTestimonial } from '@/lib/dto/testimonial';

export async function TestimonialList() {
  const rawTestimonials = await testimonialService.getPublicTestimonials();
  if (rawTestimonials.length === 0) return null;
  const testimonials = rawTestimonials.map(toPublicTestimonial);

  return (
    <div className="mt-12 bg-gray-50 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">What People Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
            <blockquote className="text-gray-700 italic mb-4">&quot;{testimonial.content}&quot;</blockquote>
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-900">{testimonial.name || 'Anonymous'}</p>
              <p className="text-sm text-gray-500">
                {testimonial.role} {testimonial.organization && `at ${testimonial.organization}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
