'use server';

import { revalidatePath } from 'next/cache';

import { DomainError } from '@/modules/domain/shared/errors';
import { createResumeModule } from '@/modules/infrastructure/composition';
import { requireUserId } from '@/shared/auth/require-user';
import {
  createResumeSchema,
  deleteResumeSchema,
  updateResumeSchema,
} from '@/shared/schemas/resume.schema';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

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
 * Updates a resume owned by the current user.
 */
export async function updateResumeAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = updateResumeSchema.parse(input);
    const { updateResume } = createResumeModule();
    const resume = await updateResume.execute(userId, parsed);
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
