import type { ResumeEntity } from '@/modules/domain/resume/resume.entity';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import type { CreateResumeDto } from '@/shared/schemas/resume.schema';

/**
 * Creates a resume variant for the authenticated user.
 */
export class CreateResumeService {
  constructor(private readonly resumes: ResumeRepository) {}

  async execute(userId: string, input: CreateResumeDto): Promise<ResumeEntity> {
    return this.resumes.create({
      userId,
      name: input.name.trim(),
      stack: input.stack,
      summary: input.summary?.trim() ? input.summary.trim() : null,
      contentText: input.contentText.trim(),
      isActive: input.isActive,
    });
  }
}
