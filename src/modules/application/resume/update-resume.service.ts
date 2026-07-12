import { NotFoundError, UnauthorizedError } from '@/modules/domain/shared/errors';
import type { ResumeEntity } from '@/modules/domain/resume/resume.entity';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import type { UpdateResumeDto } from '@/shared/schemas/resume.schema';

/**
 * Updates a resume owned by the authenticated user.
 */
export class UpdateResumeService {
  constructor(private readonly resumes: ResumeRepository) {}

  async execute(userId: string, input: UpdateResumeDto): Promise<ResumeEntity> {
    const existing = await this.resumes.findById(input.id);
    if (!existing) {
      throw new NotFoundError('Resume', input.id);
    }
    if (existing.userId !== userId) {
      throw new UnauthorizedError('You cannot update this resume');
    }

    return this.resumes.update(input.id, {
      name: input.name.trim(),
      stack: input.stack,
      locale: input.locale,
      summary: input.summary?.trim() ? input.summary.trim() : null,
      contentText: input.contentText.trim(),
      isActive: input.isActive,
    });
  }
}
