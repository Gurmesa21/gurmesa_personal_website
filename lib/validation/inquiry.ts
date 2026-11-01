import { z } from 'zod';

const noControlChars = (val: string) => !/[\x00-\x09\x0B-\x1F\x7F]/.test(val); // allow \n (x0A) for textarea

export const INQUIRY_PROJECT_TYPES = [
  'Landing page and website development',
  'Web application development',
  'Website and application management',
  'Maintenance and technical support',
  'Website and application modernization',
  'Hosting and server migration',
  'One-time feature updates and improvements',
  'Other / not sure yet',
] as const;

export type InquiryProjectType = (typeof INQUIRY_PROJECT_TYPES)[number];

export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100).refine(noControlChars, 'Invalid characters'),
  email: z.string().trim().email('Invalid email address').max(254).refine(noControlChars, 'Invalid characters'),
  organization: z.string().trim().max(150).refine(noControlChars, 'Invalid characters').optional().or(z.literal('')),
  projectType: z.enum(INQUIRY_PROJECT_TYPES).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Message is too short').max(5000, 'Message is too long').refine(noControlChars, 'Invalid characters'),
  honeypot: z.string().optional(),
  locale: z.enum(['en', 'am', 'om']).optional().default('en'),
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
