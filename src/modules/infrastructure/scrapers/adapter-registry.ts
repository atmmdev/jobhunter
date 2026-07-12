import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { GenericCareersAdapter } from '@/modules/infrastructure/scrapers/generic-careers.adapter';
import { GreenhouseAdapter } from '@/modules/infrastructure/scrapers/greenhouse.adapter';
import { LeverAdapter } from '@/modules/infrastructure/scrapers/lever.adapter';

/**
 * Resolves the correct job-source adapter for a Source record.
 */
export class JobSourceAdapterRegistry {
  private readonly adapters: JobSourceAdapter[];

  constructor(
    adapters: JobSourceAdapter[] = [
      new GreenhouseAdapter(),
      new LeverAdapter(),
      new GenericCareersAdapter(),
    ],
  ) {
    this.adapters = adapters;
  }

  /**
   * Returns the first adapter that supports the given source.
   */
  resolve(source: ScrapeSourceInput): JobSourceAdapter | null {
    return this.adapters.find((adapter) => adapter.supports(source)) ?? null;
  }

  /**
   * Lists adapter keys currently registered.
   */
  listKeys(): string[] {
    return this.adapters.map((adapter) => adapter.key);
  }
}
