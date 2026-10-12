'use server';

import { auth } from '@/auth';
import { approveComment, rejectComment, deleteComment } from '@/server/services/blogService';
import { revalidatePath } from 'next/cache';

export async function approveCommentAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  await approveComment(id);
  revalidatePath('/admin/comments');
}

export async function rejectCommentAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  await rejectComment(id);
  revalidatePath('/admin/comments');
}

export async function deleteCommentAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  
  await deleteComment(id);
  revalidatePath('/admin/comments');
}
