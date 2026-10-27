'use server';

import { revalidatePath } from 'next/cache';
import { createProject, updateProject, deleteProject, upsertCaseStudy, setProjectFeaturedMedia } from '@/server/services/projectService';
import { ProjectStatus, ProjectConfidentiality, CaseStudyStatus } from '@prisma/client';
import { redirect } from 'next/navigation';

import { validateLiveUrl } from '@/lib/validation/project';
export { validateLiveUrl };

export async function createProjectAction(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const summary = formData.get('summary') as string;
  const clientRef = formData.get('clientRef') as string;
  const internalNotes = formData.get('internalNotes') as string;
  const status = formData.get('status') as ProjectStatus;
  const confidentiality = formData.get('confidentiality') as ProjectConfidentiality;
  const liveUrlRaw = formData.get('liveUrl') as string | null;

  const featuredMediaId = formData.get('featuredMediaId') as string;

  const project = await createProject({
    title,
    slug,
    summary,
    liveUrl: validateLiveUrl(liveUrlRaw),
    clientRef: clientRef || null,
    internalNotes: internalNotes || null,
    status,
    confidentiality,
  });

  if (featuredMediaId) {
    await setProjectFeaturedMedia(project.id, featuredMediaId);
  }

  revalidatePath('/admin/projects');
  revalidatePath('/work');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  revalidatePath('/[locale]/work', 'page');
  redirect('/admin/projects');
}

export async function updateProjectAction(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const summary = formData.get('summary') as string;
  const clientRef = formData.get('clientRef') as string;
  const internalNotes = formData.get('internalNotes') as string;
  const status = formData.get('status') as ProjectStatus;
  const confidentiality = formData.get('confidentiality') as ProjectConfidentiality;
  const liveUrlRaw = formData.get('liveUrl') as string | null;

  const featuredMediaId = formData.get('featuredMediaId') as string;

  await updateProject(id, {
    title,
    slug,
    summary,
    liveUrl: validateLiveUrl(liveUrlRaw),
    clientRef: clientRef || null,
    internalNotes: internalNotes || null,
    status,
    confidentiality,
  });

  await setProjectFeaturedMedia(id, featuredMediaId || null);

  revalidatePath('/admin/projects');
  revalidatePath('/work');
  revalidatePath('/');
  revalidatePath(`/work/${slug}`);
  revalidatePath('/', 'layout');
  revalidatePath('/[locale]/work', 'page');
  revalidatePath('/[locale]/work/[slug]', 'page');
  redirect('/admin/projects');
}

export async function upsertCaseStudyAction(projectId: string, formData: FormData) {
  const problem = formData.get('problem') as string;
  const solution = formData.get('solution') as string;
  const role = formData.get('role') as string;
  const scope = formData.get('scope') as string;
  const architectureSummary = formData.get('architectureSummary') as string;
  const keyDecisions = formData.get('keyDecisions') as string;
  const challenges = formData.get('challenges') as string;
  const outcome = formData.get('outcome') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as CaseStudyStatus;

  await upsertCaseStudy(projectId, {
    problem,
    solution,
    role,
    scope,
    architectureSummary,
    keyDecisions: keyDecisions || null,
    challenges: challenges || null,
    outcome,
    content,
    status,
    publishedAt: status === 'PUBLISHED' ? new Date() : null,
  });

  revalidatePath('/admin/projects');
  revalidatePath('/work');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  revalidatePath('/[locale]/work', 'page');
  revalidatePath('/[locale]/work/[slug]', 'page');
  redirect('/admin/projects');
}

export async function deleteProjectAction(id: string) {
  await deleteProject(id);
  revalidatePath('/admin/projects');
  revalidatePath('/work');
  revalidatePath('/');
  revalidatePath('/', 'layout');
  revalidatePath('/[locale]/work', 'page');
  revalidatePath('/[locale]/work/[slug]', 'page');
}
