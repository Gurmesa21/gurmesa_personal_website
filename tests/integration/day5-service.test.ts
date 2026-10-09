import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublicServices, createService } from '../../server/services/serviceService';
import { toPublicService } from '../../lib/dto/service';
import { prisma } from '../../server/repositories/db';
import * as authModule from '../../auth';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

describe('Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPublicServices() excludes DRAFT/ARCHIVED services', async () => {
    const services = await getPublicServices();
    // Verify none of the returned services have a DRAFT or ARCHIVED status
    // (since getPublicServices returns DTOs, we check the actual DB logic via the result)
    const dbServices = await prisma.service.findMany({
      where: { id: { in: services.map(s => s.id) } }
    });
    
    expect(dbServices.every(s => s.status === 'PUBLISHED')).toBe(true);
    
    // Also explicitly verify a known DRAFT seed doesn't appear
    const draftService = await prisma.service.findUnique({ where: { slug: 'draft-service' } });
    if (draftService) {
      expect(services.map(s => s.id)).not.toContain(draftService.id);
    }
  });

  it('toPublicService() output keys match exactly the declared public allowlist', async () => {
    const mockService = {
      id: 'test-1',
      slug: 'test-slug',
      title: 'Test Title',
      summary: 'Test Summary',
      description: 'Test Description',
      deliverables: ['item 1'],
      status: 'PUBLISHED' as const,
      order: 1,
      startingPriceRange: '$1000',
      featuredImageId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dto = toPublicService(mockService);

    const allowedKeys = [
      'id', 'slug', 'title', 'summary', 'description', 'deliverables', 'startingPriceRange', 'order', 'featuredImageId'
    ];

    expect(Object.keys(dto).sort()).toEqual(allowedKeys.sort());
    
    // Ensure Private keys like createdAt or status are NOT in the DTO
    expect(dto).not.toHaveProperty('createdAt');
    expect(dto).not.toHaveProperty('status');
  });

  it('unauthenticated request to a Service admin mutation is rejected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(authModule.auth as any).mockResolvedValue(null); // Unauthenticated

    await expect(
      createService({
        title: 'Unauthorized',
        slug: 'unauth',
        summary: 'sum',
        description: 'desc',
        deliverables: [],
        status: 'DRAFT',
        order: 1,
        startingPriceRange: null,
        featuredImageId: null,
      })
    ).rejects.toThrow('Unauthorized');
  });
});
