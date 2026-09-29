import { z } from 'zod';

const noControlChars = (val: string) => !/[\x00-\x09\x0B-\x1F\x7F]/.test(val); // allow \n (x0A) for textarea

export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).refine(noControlChars, 'Invalid characters'),
  email: z.string().trim().email('Invalid email address').max(254).refine(noControlChars, 'Invalid characters'),
  organization: z.string().trim().max(150).refine(noControlChars, 'Invalid characters').optional().or(z.literal('')),
  projectType: z.enum([
    'Business website',
    'Internal system',
    'Dashboard',
    'Automation',
    'API/Integration',
    'Other'
  ]).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message is too short').max(5000, 'Message is too long').refine(noControlChars, 'Invalid characters'),
  honeypot: z.string().optional(),
  source: z.string().trim().max(200).refine(noControlChars, 'Invalid characters').optional().transform(val => {
    if (!val) return val;
    try {
      // If it's a full URL, extract just the pathname
      const url = new URL(val, 'http://localhost');
      return url.pathname;
    } catch {
      // Not a valid URL structure, just strip query/hash if present
      return val.split('?')[0].split('#')[0];
    }
  })
}).strict();

export type InquiryInput = z.input<typeof inquirySchema>;
