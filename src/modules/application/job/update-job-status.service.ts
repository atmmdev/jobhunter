import { NotFoundError } from '@/modules/domain/shared/errors';
import type { JobEntity } from '@/modules/domain/job/job.entity';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { UpdateJobStatusDto } from '@/shared/schemas/job.schema';

/**
 * Updates a job status for favorite / reject / restore flows.
 */
export class UpdateJobStatusService {
  constructor(private readonly jobs: JobRepository) {}

  async execute(input: UpdateJobStatusDto): Promise<JobEntity> {
    const existing = await this.jobs.findById(input.jobId);
    if (!existing) {
      throw new NotFoundError('Job', input.jobId);
    }

    return this.jobs.updateStatus(input.jobId, input.status);
  }
}
