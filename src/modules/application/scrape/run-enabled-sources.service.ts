import type { JobSourceAdapterRegistry } from '@/modules/infrastructure/scrapers/adapter-registry';
import type { ScrapePersistenceRepository } from '@/modules/domain/scrape/scrape-persistence.repository';
import type { RunSourceScrapeService } from '@/modules/application/scrape/run-source-scrape.service';

export interface RunEnabledSourceResult {
  sourceId: string;
  sourceName: string;
  ok: boolean;
  adapterKey?: string;
  jobsFound?: number;
  jobsCreated?: number;
  jobsUpdated?: number;
  error?: string;
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
    const sources = await this.persistence.listEnabledForScrape();
    const results: RunEnabledSourceResult[] = [];

    for (const source of sources) {
      if (!this.adapters.resolve(source)) {
        continue;
      }

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

    return results;
  }
}
