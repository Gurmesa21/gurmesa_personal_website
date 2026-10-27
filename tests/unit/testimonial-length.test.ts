import { describe, it, expect, vi } from 'vitest';

vi.mock('../../auth', () => ({
  auth: vi.fn()
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers({ 'x-forwarded-for': '127.0.0.1' }))
}));

import { testimonialService } from '../../server/services/testimonialService';
import { submitTestimonialForm } from '../../app/[locale]/(public)/testimonials/actions';

describe('TASK 1 — Testimonial Length Restrictions', () => {
  it('rejects 19-character testimonial on server-side validation', async () => {
    const text19 = '1234567890123456789';
    expect(text19.length).toBe(19);

    const formData = new FormData();
    formData.append('name', 'Length Test 19');
    formData.append('text', text19);

    const res = await submitTestimonialForm(formData);
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/20 characters/i);
  });

  it('rejects 19-character testimonial in testimonialService directly', async () => {
    const text19 = '1234567890123456789';
    await expect(testimonialService.submitPublicTestimonial({
      name: 'Direct Service Test 19',
      content: text19,
      status: 'DRAFT',
      permissionStatus: 'PENDING'
    })).rejects.toThrow(/20 characters/i);
  });

  it('accepts 20-character testimonial', async () => {
    const text20 = '12345678901234567890';
    expect(text20.length).toBe(20);

    const formData = new FormData();
    formData.append('name', 'Length Test');
    formData.append('text', text20);

    const res = await submitTestimonialForm(formData);
    expect(res.success).toBe(true);
  });

  it('accepts 199-character testimonial', async () => {
    const text199 = 'A'.repeat(199);
    expect(text199.length).toBe(199);

    const formData = new FormData();
    formData.append('name', 'Length Test 199');
    formData.append('text', text199);

    const res = await submitTestimonialForm(formData);
    expect(res.success).toBe(true);
  });

  it('accepts exactly 200-character testimonial', async () => {
    const text200 = 'B'.repeat(200);
    expect(text200.length).toBe(200);

    const formData = new FormData();
    formData.append('name', 'Length Test 200');
    formData.append('text', text200);

    const res = await submitTestimonialForm(formData);
    expect(res.success).toBe(true);
  });

  it('rejects 201-character testimonial on server-side validation', async () => {
    const text201 = 'C'.repeat(201);
    expect(text201.length).toBe(201);

    const formData = new FormData();
    formData.append('name', 'Length Test 201');
    formData.append('text', text201);

    const res = await submitTestimonialForm(formData);
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/200 characters/i);
  });

  it('rejects 201-character testimonial in testimonialService directly', async () => {
    const text201 = 'D'.repeat(201);
    await expect(testimonialService.submitPublicTestimonial({
      name: 'Direct Service Test',
      content: text201,
      status: 'DRAFT',
      permissionStatus: 'PENDING'
    })).rejects.toThrow(/200 characters/i);
  });
});
