import { Project, CaseStudy, Technology, ProjectTechnology } from '@prisma/client';

export type PublicCaseStudyDTO = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  role: string;
  scope: string;
  architectureSummary: string;
  keyDecisions: string | null;
  challenges: string | null;
  outcome: string;
  content: string;
  publishedAt: Date | null;
  updatedAt: Date;
  technologies: {
    id: string;
    name: string;
    category: string;
    slug: string;
  }[];
  liveUrl: string | null;
  // media...
};

type ProjectWithRelations = Project & {
  caseStudy: CaseStudy | null;
  technologies: (ProjectTechnology & { technology: Technology })[];
  // media...
};

export function toPublicCaseStudy(project: ProjectWithRelations): PublicCaseStudyDTO {
  if (!project.caseStudy) {
    throw new Error("Cannot map to public case study without a case study record");
  }
  
  return {
    id: project.id, // Using project ID as the primary reference
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    problem: project.caseStudy.problem,
    solution: project.caseStudy.solution,
    role: project.caseStudy.role,
    scope: project.caseStudy.scope,
    architectureSummary: project.caseStudy.architectureSummary,
    keyDecisions: project.caseStudy.keyDecisions,
    challenges: project.caseStudy.challenges,
    outcome: project.caseStudy.outcome,
    content: project.caseStudy.content,
    publishedAt: project.caseStudy.publishedAt,
    updatedAt: project.caseStudy.updatedAt,
    liveUrl: project.confidentiality === 'PUBLIC' ? (project.liveUrl ?? null) : null,
    technologies: project.technologies.map(pt => ({
      id: pt.technology.id,
      name: pt.technology.name,
      category: pt.technology.category,
      slug: pt.technology.slug,
    })),
  };
}
