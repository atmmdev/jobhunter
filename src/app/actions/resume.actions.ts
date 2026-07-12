'use server';

import { revalidatePath } from 'next/cache';

import { createResumeModule } from '@/modules/infrastructure/composition';
import { auth } from '@/modules/infrastructure/auth/auth';
import { DomainError } from '@/modules/domain/shared/errors';
import {
  createResumeSchema,
  deleteResumeSchema,
} from '@/shared/schemas/resume.schema';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new DomainError('UNAUTHORIZED', 'You must be signed in');
  }
  return session.user.id;
}

/**
 * Creates a resume for the current user.
 */
export async function createResumeAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = createResumeSchema.parse(input);
    const { createResume } = createResumeModule();
    const resume = await createResume.execute(userId, parsed);
    revalidatePath('/[locale]/resumes', 'page');
    return { ok: true, data: { id: resume.id } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

/**
 * Deletes a resume owned by the current user.
 */
export async function deleteResumeAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = deleteResumeSchema.parse(input);
    const { deleteResume } = createResumeModule();
    await deleteResume.execute(userId, parsed);
    revalidatePath('/[locale]/resumes', 'page');
    return { ok: true, data: { id: parsed.id } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}
