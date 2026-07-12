'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { DomainError } from '@/modules/domain/shared/errors';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createScoringModule } from '@/modules/infrastructure/composition';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const scoreJobSchema = z.object({
  jobId: z.string().uuid(),
});

/**
 * Scores a job and recommends the best active resume.
 */
export async function scoreJobAction(
  input: unknown,
): Promise<
  ActionResult<{
    score: number;
    explanation: string;
    recommendedResumeId: string | null;
    usedAi: boolean;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const parsed = scoreJobSchema.parse(input);
    const { scoreJob } = createScoringModule();
    const result = await scoreJob.execute(session.user.id, parsed.jobId);

    revalidatePath('/[locale]/jobs', 'page');
    revalidatePath('/[locale]/dashboard', 'page');

    return {
      ok: true,
      data: {
        score: result.score,
        explanation: result.explanation,
        recommendedResumeId: result.recommendedResumeId,
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
