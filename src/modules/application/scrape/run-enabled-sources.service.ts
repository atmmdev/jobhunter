import type { RunSourceScrapeService } from '@/modules/application/scrape/run-source-scrape.service';
import type { ScrapePersistenceRepository } from '@/modules/domain/scrape/scrape-persistence.repository';
import { scrapeConcurrencyGuard } from '@/modules/infrastructure/scrape/scrape-concurrency-guard';
import type { JobSourceAdapterRegistry } from '@/modules/infrastructure/scrapers/adapter-registry';
import { delay, getScrapeDelayMs } from '@/shared/lib/delay';
import { createCorrelationId, rootLogger } from '@/shared/logging/logger';

export interface RunEnabledSourceResult {
  sourceId: string;
  sourceName: string;
  ok: boolean;
  adapterKey?: string;
  jobsFound?: number;
  jobsCreated?: number;
  jobsUpdated?: number;
  error?: string;
  correlationId?: string;
}

/**
 * Runs scrape jobs for all enabled sources that have a registered adapter.
 */
export class RunEnabledSourcesService {
  constructor(
    private readonly persistence: ScrapePersistenceRepository,
    private readonly runSource: RunSourceScrapeService,
    private readonly adapters: JobSourceAdapterRegistry,
  ) {}

  async execute(): Promise<RunEnabledSourceResult[]> {
    return scrapeConcurrencyGuard.runBatchExclusive(() => this.executeUnlocked());
  }

  private async executeUnlocked(): Promise<RunEnabledSourceResult[]> {
    const batchId = createCorrelationId('scrape-batch');
    const log = rootLogger.child({ correlationId: batchId });
    const sources = await this.persistence.listEnabledForScrape();
    const delayMs = getScrapeDelayMs();
    const results: RunEnabledSourceResult[] = [];
    let runnableIndex = 0;

    log.info('scrape.batch.started', { sourceCount: sources.length, delayMs });

    for (const source of sources) {
      if (!this.adapters.resolve(source)) {
        continue;
      }

      if (runnableIndex > 0 && delayMs > 0) {
        await delay(delayMs);
      }
      runnableIndex += 1;

      try {
        const result = await this.runSource.execute({ sourceId: source.id });
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          ok: true,
          adapterKey: result.adapterKey,
          jobsFound: result.jobsFound,
          jobsCreated: result.jobsCreated,
          jobsUpdated: result.jobsUpdated,
          correlationId: result.correlationId,
        });
      } catch (error) {
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown scrape error',
        });
      }
    }

    log.info('scrape.batch.finished', {
      ran: results.length,
      ok: results.filter((item) => item.ok).length,
      failed: results.filter((item) => !item.ok).length,
    });

    return results;
  }
}
