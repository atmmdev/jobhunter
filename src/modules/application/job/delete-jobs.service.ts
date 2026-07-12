import { NotFoundError, ValidationError } from '@/modules/domain/shared/errors';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { DeleteJobsDto } from '@/shared/schemas/job.schema';

/**
 * Permanently deletes one or more jobs.
 */
export class DeleteJobsService {
  constructor(private readonly jobs: JobRepository) {}

  async execute(input: DeleteJobsDto): Promise<{ deleted: number }> {
    if (input.jobIds.length === 0) {
      throw new ValidationError('Select at least one job to delete');
    }

    if (input.jobIds.length === 1) {
      const jobId = input.jobIds[0];
      if (!jobId) {
        throw new ValidationError('Invalid job id');
      }
      const existing = await this.jobs.findById(jobId);
      if (!existing) {
        throw new NotFoundError('Job', jobId);
      }
      await this.jobs.delete(jobId);
      return { deleted: 1 };
    }

    const deleted = await this.jobs.deleteMany(input.jobIds);
    return { deleted };
  }
}
