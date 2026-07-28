import type {
  CompanySeedRepository,
  ListSourcesResult,
} from '@/modules/domain/company/company-seed.repository';
import type { ListSourcesQueryDto } from '@/shared/schemas/source.schema';

/**
 * Lists configured crawl/ingest sources for the admin UI.
 */
export class ListSourcesService {
  constructor(private readonly seeds: CompanySeedRepository) {}

  async execute(query: ListSourcesQueryDto): Promise<ListSourcesResult> {
    return this.seeds.listSources({
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      search: query.search,
    });
  }
}
