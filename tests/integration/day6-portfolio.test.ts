import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPublicProjects, getPublicCaseStudyBySlug, createProject, updateProject, deleteProject, upsertCaseStudy } from '../../server/services/projectService';
import * as authModule from '../../auth';
import { toPublicCaseStudy } from '../../lib/dto/project';
import { prisma } from '../../server/repositories/db';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

describe('Day 6 - Portfolio & Case Studies Confidentiality (SEC-ACL-02 & SEC-ACL-03)', () => {
  let privateProjectSlug: string;
  let unpublishedCaseStudySlug: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Default to admin for most of the tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(authModule.auth as any).mockResolvedValue({ user: { id: 'admin', role: 'ADMIN' } });

    // 1. Ensure we have a PRIVATE project with a PUBLISHED case study (SEC-ACL-02)
    let privateProject = await prisma.project.findFirst({
      where: { confidentiality: 'PRIVATE' },
      include: { caseStudy: true }
    });
    if (!privateProject) {
      privateProject = await prisma.project.create({
        data: {
          title: 'Private Test Project',
          slug: 'private-test-project',
          summary: 'Sum',
          status: 'ACTIVE',
          confidentiality: 'PRIVATE',
          clientRef: 'Secret Client',
          internalNotes: 'Secret notes',
          caseStudy: {
            create: {
              problem: 'p', solution: 's', role: 'r', scope: 's', architectureSummary: 'a', outcome: 'o', content: 'c', status: 'PUBLISHED'
            }
          }
        },
        include: { caseStudy: true }
      });
    } else if (!privateProject.caseStudy || privateProject.caseStudy.status !== 'PUBLISHED') {
      await prisma.caseStudy.upsert({
        where: { projectId: privateProject.id },
        update: { status: 'PUBLISHED' },
        create: {
          projectId: privateProject.id,
          problem: 'p', solution: 's', role: 'r', scope: 's', architectureSummary: 'a', outcome: 'o', content: 'c', status: 'PUBLISHED'
        }
      });
    }
    privateProjectSlug = privateProject.slug;

    // 2. Ensure we have a PUBLIC/ANONYMIZED project with a DRAFT case study (SEC-ACL-03)
    let unpublishedCaseStudy = await prisma.project.findFirst({
      where: { confidentiality: 'PUBLIC', caseStudy: { status: 'DRAFT' } },
    });
    if (!unpublishedCaseStudy) {
      unpublishedCaseStudy = await prisma.project.create({
        data: {
          title: 'Unpublished CS Project',
          slug: 'unpublished-cs-project',
          summary: 'Sum',
          status: 'ACTIVE',
          confidentiality: 'PUBLIC',
          caseStudy: {
            create: {
              problem: 'p', solution: 's', role: 'r', scope: 's', architectureSummary: 'a', outcome: 'o', content: 'c', status: 'DRAFT'
            }
          }
        }
      });
    }
    unpublishedCaseStudySlug = unpublishedCaseStudy.slug;
  });

  describe('SEC-ACL-02: Private Project Isolation', () => {
    it('(a) getPublicProjects() — never appears in the list', async () => {
      const publicProjects = await getPublicProjects();
      const slugs = publicProjects.map(p => p.slug);
      expect(slugs).not.toContain(privateProjectSlug);
    });

    it('(b) getPublicCaseStudyBySlug(slug) — returns null for private project', async () => {
      const result = await getPublicCaseStudyBySlug(privateProjectSlug);
      expect(result).toBeNull();
    });
  });

  describe('SEC-ACL-03: Unpublished Case Study Isolation', () => {
    it('(a) getPublicProjects() — never appears in the list if case study is DRAFT', async () => {
      const publicProjects = await getPublicProjects();
      const slugs = publicProjects.map(p => p.slug);
      expect(slugs).not.toContain(unpublishedCaseStudySlug);
    });

    it('(b) getPublicCaseStudyBySlug(slug) — returns null if case study is DRAFT', async () => {
      const result = await getPublicCaseStudyBySlug(unpublishedCaseStudySlug);
      expect(result).toBeNull();
    });
  });

  describe('DTO Allowlist', () => {
    it('toPublicCaseStudy() output keys explicitly exclude clientRef and internalNotes', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockProject: any = {
        id: 'test', title: 't', slug: 's', summary: 's',
        clientRef: 'SECRET_CLIENT',
        internalNotes: 'SECRET_NOTES',
        technologies: [],
        caseStudy: {
          problem: 'p', solution: 's', role: 'r', scope: 's', architectureSummary: 'a',
          keyDecisions: 'k', challenges: 'c', outcome: 'o', content: 'c',
          publishedAt: new Date(), updatedAt: new Date(),
        }
      };

      const publicDto = toPublicCaseStudy(mockProject);
      expect(publicDto).not.toHaveProperty('clientRef');
      expect(publicDto).not.toHaveProperty('internalNotes');
      expect(Object.values(publicDto)).not.toContain('SECRET_CLIENT');
      expect(Object.values(publicDto)).not.toContain('SECRET_NOTES');
    });
  });

  describe('Admin Mutations (SEC-ACL-01 equivalent)', () => {
    it('Project/CaseStudy mutations reject unauthenticated requests', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(authModule.auth as any).mockResolvedValue(null);

      await expect(createProject({ title: 't', slug: 's', summary: 's', status: 'ACTIVE', confidentiality: 'PRIVATE' })).rejects.toThrow('Unauthorized');
      await expect(updateProject('any-id', { title: 't2' })).rejects.toThrow('Unauthorized');
      await expect(deleteProject('any-id')).rejects.toThrow('Unauthorized');
      await expect(upsertCaseStudy('any-id', { problem: 'p', solution: 's', role: 'r', scope: 's', architectureSummary: 'a', outcome: 'o', content: 'c', status: 'DRAFT' })).rejects.toThrow('Unauthorized');
    });
  });
});
