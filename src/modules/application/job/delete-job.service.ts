import { NotFoundError } from '@/modules/domain/shared/errors';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { DeleteJobDto } from '@/shared/schemas/job.schema';

/**
 * Permanently deletes a job and its dependent records (scores, applications, etc.).
 */
export class DeleteJobService {
  constructor(private readonly jobs: JobRepository) {}

  async execute(input: DeleteJobDto): Promise<void> {
    const job = await this.jobs.findById(input.jobId);
    if (!job) {
      throw new NotFoundError('Job', input.jobId);
    }

    await this.jobs.delete(input.jobId);
  }
}
