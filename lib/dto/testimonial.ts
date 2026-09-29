import { Testimonial } from '@prisma/client';

export type PublicTestimonial = {
  id: string;
  content: string;
  role: string | null;
  name?: string;
  organization?: string | null;
};

export function toPublicTestimonial(testimonial: Testimonial): PublicTestimonial {
  if (testimonial.isAnonymous) {
    return {
      id: testimonial.id,
      content: testimonial.content,
      role: testimonial.role,
    };
  }

  return {
    id: testimonial.id,
    content: testimonial.content,
    role: testimonial.role,
    name: testimonial.name,
    organization: testimonial.organization,
  };
}
