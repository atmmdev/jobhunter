'use server';

import { revalidatePath } from 'next/cache';

import { DomainError } from '@/modules/domain/shared/errors';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createScrapeModule } from '@/modules/infrastructure/composition';
import { runSourceSchema } from '@/shared/schemas/scrape.schema';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Runs job discovery for a single source (Greenhouse/Lever today).
 */
export async function runSourceScrapeAction(
  input: unknown,
): Promise<
  ActionResult<{
    jobsFound: number;
    jobsCreated: number;
    jobsUpdated: number;
    adapterKey: string;
    status: string;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const parsed = runSourceSchema.parse(input);
    const { runSource } = createScrapeModule();
    const result = await runSource.execute(parsed);

    revalidatePath('/[locale]/sources', 'page');
    revalidatePath('/[locale]/jobs', 'page');

    return {
      ok: true,
      data: {
        jobsFound: result.jobsFound,
        jobsCreated: result.jobsCreated,
        jobsUpdated: result.jobsUpdated,
        adapterKey: result.adapterKey,
        status: result.status,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}
