'use server';

import { headers } from 'next/headers';
import { testimonialService } from '@/server/services/testimonialService';
import { getIpFromHeaders, testimonialRateLimiter } from '@/lib/rate-limit';

export async function submitTestimonialForm(formData: FormData) {
  try {
    const honeypot = formData.get('website_url') as string;
    if (honeypot) {
      // SPAM bot filled the honeypot
      return { success: true }; // Fake success
    }

    const headerStore = await headers();
    const ip = getIpFromHeaders(headerStore);
    
    // Rate limit: max 3 per hour
    const allowed = await testimonialRateLimiter.check(ip);
    if (!allowed) {
      throw new Error('RATE_LIMIT');
    }
    
    const input = {
      name: formData.get('name') as string,
      organization: (formData.get('organization') as string) || null,
      role: (formData.get('role') as string) || null,
      content: formData.get('text') as string,
      isAnonymous: formData.get('isAnonymous') === 'on',
      status: 'DRAFT' as const,
      permissionStatus: 'PENDING' as const,
    };

    if (!input.name || !input.content) {
      return { success: false, error: 'Name and text are required.' };
    }

    if (input.content.length > 200) {
      return { success: false, error: 'Testimonial text must not exceed 200 characters.' };
    }

    await testimonialService.submitPublicTestimonial(input as any);

    return { success: true };
  } catch (error: any) {
    if (error?.message?.startsWith('RATE_LIMIT')) {
      return { success: false, error: 'You have submitted too many testimonials. Please try again later.' };
    }
    
    console.error('Testimonial Form Error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}
