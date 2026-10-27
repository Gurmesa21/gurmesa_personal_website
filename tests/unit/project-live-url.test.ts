import { describe, it, expect } from 'vitest';
import { toPublicCaseStudy } from '@/lib/dto/project';

describe('Project liveUrl tests', () => {
  it('maps liveUrl properly to PublicCaseStudyDTO', () => {
    const mockProject: any = {
      id: 'proj-1',
      title: 'Distributed Cloud Architecture',
      slug: 'distributed-cloud',
      summary: 'Summary test',
      liveUrl: 'https://avenor.example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      caseStudy: {
        id: 'cs-1',
        problem: 'Latency issue',
        solution: 'Edge nodes',
        role: 'Lead Architect',
        scope: 'Enterprise',
        architectureSummary: 'Microservices',
        keyDecisions: 'Rust vs Go',
        challenges: 'Data sync',
        outcome: '99.999% uptime',
        content: 'Full deep dive',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      technologies: [],
    };

    const dto = toPublicCaseStudy(mockProject);
    expect(dto.liveUrl).toBe('https://avenor.example.com');
  });

  it('handles null liveUrl correctly', () => {
    const mockProject: any = {
      id: 'proj-2',
      title: 'Internal API',
      slug: 'internal-api',
      summary: 'Internal project',
      liveUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      caseStudy: {
        id: 'cs-2',
        problem: 'Legacy system',
        solution: 'Refactor',
        role: 'Engineer',
        scope: 'Internal',
        architectureSummary: 'Monolith to modules',
        outcome: 'Clean code',
        content: 'Content',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      technologies: [],
    };

    const dto = toPublicCaseStudy(mockProject);
    expect(dto.liveUrl).toBeNull();
  });
});
