'use server';

import { revalidatePath } from 'next/cache';

import { DomainError } from '@/modules/domain/shared/errors';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createCoverLetterModule } from '@/modules/infrastructure/composition';
import {
  generateCoverLetterSchema,
  updateCoverLetterSchema,
} from '@/shared/schemas/cover-letter.schema';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Generates a cover letter for an application.
 */
export async function generateCoverLetterAction(
  input: unknown,
): Promise<ActionResult<{ id: string; content: string; usedAi: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const parsed = generateCoverLetterSchema.parse(input);
    const { generateCoverLetter } = createCoverLetterModule();
    const candidateName =
      session.user.name?.trim() ||
      session.user.email?.split('@')[0] ||
      'Candidate';

    const result = await generateCoverLetter.execute(
      session.user.id,
      candidateName,
      parsed,
    );

    revalidatePath('/[locale]/applications', 'page');

    return {
      ok: true,
      data: {
        id: result.coverLetter.id,
        content: result.coverLetter.content,
        usedAi: result.usedAi,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

/**
 * Saves edited cover letter content.
 */
export async function updateCoverLetterAction(
  input: unknown,
): Promise<ActionResult<{ id: string; content: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const parsed = updateCoverLetterSchema.parse(input);
    const { updateCoverLetter } = createCoverLetterModule();
    const letter = await updateCoverLetter.execute(session.user.id, parsed);

    revalidatePath('/[locale]/applications', 'page');

    return { ok: true, data: { id: letter.id, content: letter.content } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}
