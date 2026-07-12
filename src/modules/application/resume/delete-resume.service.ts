import { NotFoundError, UnauthorizedError } from '@/modules/domain/shared/errors';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import type { DeleteResumeDto } from '@/shared/schemas/resume.schema';

/**
 * Deletes a resume owned by the authenticated user.
 */
export class DeleteResumeService {
  constructor(private readonly resumes: ResumeRepository) {}

  async execute(userId: string, input: DeleteResumeDto): Promise<void> {
    const resume = await this.resumes.findById(input.id);
    if (!resume) {
      throw new NotFoundError('Resume', input.id);
    }
    if (resume.userId !== userId) {
      throw new UnauthorizedError('You cannot delete this resume');
    }

    await this.resumes.delete(input.id);
  }
}
