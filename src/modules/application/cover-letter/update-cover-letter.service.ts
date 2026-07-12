import type { ApplicationRepository } from '@/modules/domain/application/application.repository';
import type { CoverLetterRepository } from '@/modules/domain/cover-letter/cover-letter.repository';
import type { CoverLetterEntity } from '@/modules/domain/cover-letter/cover-letter.entity';
import { NotFoundError } from '@/modules/domain/shared/errors';
import type { UpdateCoverLetterDto } from '@/shared/schemas/cover-letter.schema';

/**
 * Updates cover letter content after user review.
 */
export class UpdateCoverLetterService {
  constructor(
    private readonly coverLetters: CoverLetterRepository,
    private readonly applications: ApplicationRepository,
  ) {}

  async execute(userId: string, input: UpdateCoverLetterDto): Promise<CoverLetterEntity> {
    const letter = await this.coverLetters.findById(input.coverLetterId);
    if (!letter || letter.userId !== userId) {
      throw new NotFoundError('CoverLetter', input.coverLetterId);
    }

    const application = await this.applications.findByUserAndJob(userId, letter.jobId);
    if (!application || application.coverLetterId !== letter.id) {
      throw new NotFoundError('Application for cover letter');
    }

    return this.coverLetters.updateContent(letter.id, input.content);
  }
}
