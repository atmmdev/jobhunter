import type { ResumeEntity } from '@/modules/domain/resume/resume.entity';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';

/**
 * Lists resumes owned by a user.
 */
export class ListResumesService {
  constructor(private readonly resumes: ResumeRepository) {}

  async execute(userId: string): Promise<ResumeEntity[]> {
    return this.resumes.listByUser(userId);
  }
}
