import type { CompanySeedRepository } from '@/modules/domain/company/company-seed.repository';

/**
 * Lists configured crawl/ingest sources for the admin UI.
 */
export class ListSourcesService {
  constructor(private readonly seeds: CompanySeedRepository) {}

  async execute() {
    return this.seeds.listSources();
  }
}
