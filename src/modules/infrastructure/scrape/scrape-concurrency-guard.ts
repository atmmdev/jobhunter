import { DomainError } from '@/modules/domain/shared/errors';

/**
 * In-process scrape concurrency guard (Phase 9 foundation before Redis/BullMQ).
 * Prevents overlapping runs for the same source or a global batch.
 */
export class ScrapeConcurrencyGuard {
  private readonly activeSources = new Set<string>();
  private batchRunning = false;

  /**
   * Runs work exclusively for a source id.
   */
  async runExclusive<T>(sourceId: string, work: () => Promise<T>): Promise<T> {
    if (this.activeSources.has(sourceId)) {
      throw new DomainError(
        'SCRAPE_IN_PROGRESS',
        `Scrape already in progress for source ${sourceId}`,
      );
    }
    this.activeSources.add(sourceId);
    try {
      return await work();
    } finally {
      this.activeSources.delete(sourceId);
    }
  }

  /**
   * Runs a full enabled-sources batch exclusively.
   */
  async runBatchExclusive<T>(work: () => Promise<T>): Promise<T> {
    if (this.batchRunning) {
      throw new DomainError('SCRAPE_BATCH_IN_PROGRESS', 'A scrape batch is already running');
    }
    this.batchRunning = true;
    try {
      return await work();
    } finally {
      this.batchRunning = false;
    }
  }

  /**
   * Returns whether a source scrape is currently active.
   */
  isSourceActive(sourceId: string): boolean {
    return this.activeSources.has(sourceId);
  }

  /**
   * Returns whether a batch scrape is currently active.
   */
  isBatchActive(): boolean {
    return this.batchRunning;
  }
}

/** Process-wide scrape guard (single Next.js / CLI process). */
export const scrapeConcurrencyGuard = new ScrapeConcurrencyGuard();
