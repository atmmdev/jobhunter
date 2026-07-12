import type { ScrapeRunRepository } from '@/modules/domain/scrape/scrape-run.repository';

/**
 * Lists recent scrape runs for the Sources admin page.
 */
export class ListScrapeRunsService {
  constructor(private readonly runs: ScrapeRunRepository) {}

  async execute(limit = 20) {
    return this.runs.listRecent(limit);
  }
}
