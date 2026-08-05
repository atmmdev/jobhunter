'use server';

import { revalidatePath } from 'next/cache';

import { createScrapeModule } from '@/modules/infrastructure/composition';
import { requireUserId } from '@/shared/auth/require-user';
import { runSourceSchema } from '@/shared/schemas/scrape.schema';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Runs or enqueues job discovery for a single source.
 * Uses BullMQ when REDIS_URL is set; otherwise runs inline.
 */
export async function runSourceScrapeAction(
  input: unknown,
): Promise<
  ActionResult<{
    mode: 'queued' | 'inline';
    jobId?: string;
    jobsFound?: number;
    jobsCreated?: number;
    jobsUpdated?: number;
    adapterKey?: string;
    status?: string;
  }>
> {
  try {
    const userId = await requireUserId();
    const parsed = runSourceSchema.parse(input);
    const { runSource, enqueueScrape } = createScrapeModule();

    if (enqueueScrape.isQueueEnabled()) {
      const queued = await enqueueScrape.enqueueSource(parsed.sourceId, userId);
      revalidatePath('/[locale]/sources', 'page');
      return {
        ok: true,
        data: {
          mode: 'queued',
          jobId: queued.jobId,
        },
      };
    }

    const result = await runSource.execute(parsed);
    revalidatePath('/[locale]/sources', 'page');
    revalidatePath('/[locale]/jobs', 'page');

    return {
      ok: true,
      data: {
        mode: 'inline',
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
