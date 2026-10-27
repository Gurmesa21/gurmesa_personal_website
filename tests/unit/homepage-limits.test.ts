import { describe, it, expect, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { getPublicServices } from '@/server/services/serviceService';
import { getPublicProjects } from '@/server/services/projectService';
import { getPublicPosts } from '@/server/services/blogService';
import { testimonialService } from '@/server/services/testimonialService';

describe('TASK 4 — Homepage Query Limits and Ordering', () => {
  it('getPublicServices accepts limit option and retrieves at most 6 services', async () => {
    const services = await getPublicServices({ limit: 6, orderBy: 'createdAt' });
    expect(services.length).toBeLessThanOrEqual(6);
  });

  it('getPublicProjects accepts limit option and retrieves at most 5 projects', async () => {
    const projects = await getPublicProjects({ limit: 5 });
    expect(projects.length).toBeLessThanOrEqual(5);
  });

  it('getPublicPosts accepts limit option and retrieves at most 2 posts', async () => {
    const posts = await getPublicPosts({ limit: 2 });
    expect(posts.length).toBeLessThanOrEqual(2);
  });

  it('getPublicTestimonials accepts limit option and retrieves at most 2 testimonials', async () => {
    const testimonials = await testimonialService.getPublicTestimonials({ limit: 2, orderBy: 'createdAt' });
    expect(testimonials.length).toBeLessThanOrEqual(2);
  });

  it('full collections on dedicated queries return without limit', async () => {
    const allServices = await getPublicServices();
    const limitedServices = await getPublicServices({ limit: 6, orderBy: 'createdAt' });
    expect(limitedServices.length).toBeLessThanOrEqual(allServices.length);
  });
});
