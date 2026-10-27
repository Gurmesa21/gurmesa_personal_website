import { describe, it, expect } from 'vitest';
import { toPublicCaseStudy } from '@/lib/dto/project';
import { validateLiveUrl } from '@/lib/validation/project';

describe('Project liveUrl tests', () => {
  it('maps liveUrl properly to PublicCaseStudyDTO for PUBLIC project', () => {
    const mockProject: any = {
      id: 'proj-1',
      title: 'Distributed Cloud Architecture',
      slug: 'distributed-cloud',
      summary: 'Summary test',
      confidentiality: 'PUBLIC',
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

  it('liveUrl is null in DTO for ANONYMIZED project even if liveUrl exists in database', () => {
    const mockProject: any = {
      id: 'proj-anon',
      title: 'Secret FinTech Platform',
      slug: 'secret-fintech',
      summary: 'Anonymized summary',
      confidentiality: 'ANONYMIZED',
      liveUrl: 'https://secret-client.example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      caseStudy: {
        id: 'cs-anon',
        problem: 'Confidential problem',
        solution: 'Confidential solution',
        role: 'Lead Architect',
        scope: 'Confidential',
        architectureSummary: 'Microservices',
        keyDecisions: 'Internal',
        challenges: 'Scale',
        outcome: 'Success',
        content: 'Protected details',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      technologies: [],
    };

    const dto = toPublicCaseStudy(mockProject);
    expect(dto.liveUrl).toBeNull();
  });

  it('liveUrl is null in DTO for PRIVATE project', () => {
    const mockProject: any = {
      id: 'proj-private',
      title: 'Private Defense System',
      slug: 'private-defense',
      summary: 'Private summary',
      confidentiality: 'PRIVATE',
      liveUrl: 'https://classified.example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      caseStudy: {
        id: 'cs-priv',
        problem: 'Classified',
        solution: 'Classified',
        role: 'Consultant',
        scope: 'Classified',
        architectureSummary: 'Air-gapped',
        outcome: 'Delivered',
        content: 'Classified',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      technologies: [],
    };

    const dto = toPublicCaseStudy(mockProject);
    expect(dto.liveUrl).toBeNull();
  });

  it('handles null liveUrl correctly', () => {
    const mockProject: any = {
      id: 'proj-2',
      title: 'Internal API',
      slug: 'internal-api',
      summary: 'Internal project',
      confidentiality: 'PUBLIC',
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

  describe('validateLiveUrl server-side validation', () => {
    it('accepts valid https URL', () => {
      expect(validateLiveUrl('https://example.com')).toBe('https://example.com');
      expect(validateLiveUrl('http://sub.domain.org/path?query=1')).toBe('http://sub.domain.org/path?query=1');
    });

    it('returns null for empty or whitespace values', () => {
      expect(validateLiveUrl('')).toBeNull();
      expect(validateLiveUrl('   ')).toBeNull();
      expect(validateLiveUrl(null)).toBeNull();
      expect(validateLiveUrl(undefined)).toBeNull();
    });

    it('rejects javascript: scheme', () => {
      expect(() => validateLiveUrl('javascript:alert(1)')).toThrow(/http:\/\/ or https:\/\//i);
    });

    it('rejects data: scheme', () => {
      expect(() => validateLiveUrl('data:text/html,<script>alert(1)</script>')).toThrow(/http:\/\/ or https:\/\//i);
    });

    it('rejects malformed and other non-http/https schemes', () => {
      expect(() => validateLiveUrl('ftp://example.com')).toThrow(/http:\/\/ or https:\/\//i);
      expect(() => validateLiveUrl('not-a-valid-url')).toThrow(/Invalid URL format/i);
    });

    it('rejects URLs exceeding 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2040);
      expect(() => validateLiveUrl(longUrl)).toThrow(/2048 characters/i);
    });
  });
});
