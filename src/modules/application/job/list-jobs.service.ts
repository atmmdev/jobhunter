import type { JobRepository, ListJobsResult } from '@/modules/domain/job/job.repository';
import type { ListJobsQueryDto } from '@/shared/schemas/job.schema';

/**
 * Lists jobs with optional status/search filters.
 */
export class ListJobsService {
  constructor(private readonly jobs: JobRepository) {}

  async execute(query: ListJobsQueryDto): Promise<ListJobsResult> {
    return this.jobs.list({
      status: query.status,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
