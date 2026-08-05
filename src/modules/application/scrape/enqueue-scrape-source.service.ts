import type { Queue } from 'bullmq';

import { DomainError } from '@/modules/domain/shared/errors';
import {
  createScrapeQueue,
  isRedisConfigured,
  type ScrapeSourceJobData,
} from '@/modules/infrastructure/queue/scrape-queue';

export interface EnqueueScrapeSourceResult {
  mode: 'queued' | 'inline';
  jobId?: string;
}

/**
 * Enqueues a source scrape on BullMQ when Redis is available.
 */
export class EnqueueScrapeSourceService {
  private queue: Queue<ScrapeSourceJobData | Record<string, never>> | null | undefined;

  private getQueue(): Queue<ScrapeSourceJobData | Record<string, never>> | null {
    if (this.queue === undefined) {
      this.queue = createScrapeQueue();
    }
    return this.queue;
  }

  /**
   * Returns whether background queue mode is active.
   */
  isQueueEnabled(): boolean {
    return isRedisConfigured() && this.getQueue() !== null;
  }

  async enqueueSource(sourceId: string, requestedBy?: string): Promise<EnqueueScrapeSourceResult> {
    const queue = this.getQueue();
    if (!queue) {
      return { mode: 'inline' };
    }

    const job = await queue.add(
      'scrape-source',
      { sourceId, requestedBy },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    return { mode: 'queued', jobId: job.id };
  }

  async enqueueEnabledBatch(): Promise<EnqueueScrapeSourceResult> {
    const queue = this.getQueue();
    if (!queue) {
      throw new DomainError(
        'QUEUE_UNAVAILABLE',
        'REDIS_URL is required to enqueue scrape-enabled batches',
      );
    }

    const job = await queue.add(
      'scrape-enabled',
      {},
      {
        attempts: 1,
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );

    return { mode: 'queued', jobId: job.id };
  }
}
