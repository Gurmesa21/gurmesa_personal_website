import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('TASK 10 — Testimonials Removed from Privacy and Terms', () => {
  it('Privacy Policy page does not render TestimonialList', () => {
    const privacyPath = path.join(process.cwd(), 'app', '[locale]', '(public)', 'privacy', 'page.tsx');
    const content = fs.readFileSync(privacyPath, 'utf8');
    expect(content).not.toContain('<TestimonialList');
    expect(content).not.toContain('import { TestimonialList }');
  });

  it('Terms of Service page does not render TestimonialList', () => {
    const termsPath = path.join(process.cwd(), 'app', '[locale]', '(public)', 'terms', 'page.tsx');
    const content = fs.readFileSync(termsPath, 'utf8');
    expect(content).not.toContain('<TestimonialList');
    expect(content).not.toContain('import { TestimonialList }');
  });

  it('Testimonials page still renders testimonials', () => {
    const testimonialsPath = path.join(process.cwd(), 'app', '[locale]', '(public)', 'testimonials', 'page.tsx');
    const content = fs.readFileSync(testimonialsPath, 'utf8');
    expect(content).toContain('testimonialService');
  });
});
