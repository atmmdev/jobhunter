import type { AppLocale } from '@/modules/domain/user/user.entity';
import type { CoverLetterEntity } from '@/modules/domain/cover-letter/cover-letter.entity';

export interface CreateCoverLetterInput {
  userId: string;
  jobId: string;
  resumeId: string;
  content: string;
  locale: AppLocale;
  model?: string | null;
  promptVersion?: string | null;
}

/**
 * Persistence port for cover letters.
 */
export interface CoverLetterRepository {
  findById(id: string): Promise<CoverLetterEntity | null>;
  create(input: CreateCoverLetterInput): Promise<CoverLetterEntity>;
  updateContent(id: string, content: string): Promise<CoverLetterEntity>;
}
