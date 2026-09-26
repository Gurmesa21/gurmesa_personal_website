import { projectRepository } from '../repositories/projectRepository';
import { prisma } from '../repositories/db';
import { toPublicCaseStudy, PublicCaseStudyDTO } from '../../lib/dto/project';
import { Prisma } from '@prisma/client';
import { auth } from '../../auth';

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
}

/**
 * Returns ONLY projects where confidentiality != 'PRIVATE' AND an associated CaseStudy exists 
 * AND that CaseStudy's status == 'PUBLISHED'.
 */
export async function getPublicProjects(): Promise<PublicCaseStudyDTO[]> {
  const projects = await prisma.project.findMany({
    where: {
      confidentiality: { not: 'PRIVATE' },
      caseStudy: {
        status: 'PUBLISHED'
      }
    },
    include: {
      caseStudy: true,
      technologies: {
        include: { technology: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return projects.map(toPublicCaseStudy);
}

export async function getPublicCaseStudyBySlug(slug: string): Promise<PublicCaseStudyDTO | null> {
  const project = await prisma.project.findFirst({
    where: {
      slug,
      confidentiality: { not: 'PRIVATE' },
      caseStudy: {
        status: 'PUBLISHED'
      }
    },
    include: {
      caseStudy: true,
      technologies: {
        include: { technology: true }
      }
    }
  });

  if (!project || !project.caseStudy) return null;
  return toPublicCaseStudy(project);
}

export async function getAdminProjects() {
  await requireAdmin();
  return prisma.project.findMany({
    include: {
      caseStudy: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAdminProjectById(id: string) {
  await requireAdmin();
  return prisma.project.findUnique({
    where: { id },
    include: {
      caseStudy: true,
      technologies: {
        include: { technology: true }
      }
    }
  });
}

export async function createProject(data: Prisma.ProjectCreateInput) {
  await requireAdmin();
  return projectRepository.create({ data });
}

export async function updateProject(id: string, data: Prisma.ProjectUpdateInput) {
  await requireAdmin();
  return projectRepository.update({
    where: { id },
    data
  });
}

export async function deleteProject(id: string) {
  await requireAdmin();
  return projectRepository.delete({
    where: { id }
  });
}

// Optional helper to directly interact with CaseStudy
export async function upsertCaseStudy(projectId: string, data: Omit<Prisma.CaseStudyCreateInput, 'project'>) {
  await requireAdmin();
  return prisma.caseStudy.upsert({
    where: { projectId },
    update: data,
    create: {
      ...data,
      project: { connect: { id: projectId } }
    }
  });
}
