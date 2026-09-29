'use server';

import { headers } from 'next/headers';
import { inquiryService } from '@/server/services/inquiryService';
import { getIpFromHeaders } from '@/lib/rate-limit';

export async function submitContactForm(formData: FormData) {
  try {
    const headerStore = await headers();
    const ip = getIpFromHeaders(headerStore);
    
    const input = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      organization: formData.get('organization') as string,
      projectType: formData.get('projectType') as string,
      message: formData.get('message') as string,
      honeypot: formData.get('honeypot') as string,
      source: formData.get('source') as string,
    } as unknown as import('@/lib/validation/inquiry').InquiryInput;

    await inquiryService.submitInquiry(input, ip);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.startsWith('RATE_LIMIT')) {
      return { success: false, error: 'You have submitted too many inquiries. Please try again later.' };
    }
    // Zod errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as unknown as { flatten: () => { fieldErrors: Record<string, string[]> } };
      return { success: false, error: 'Invalid input. Please check the fields.', fieldErrors: zodError.flatten().fieldErrors };
    }
    
    console.error('Contact Form Error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again or use direct contact methods.' };
  }
}
