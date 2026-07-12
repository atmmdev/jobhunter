import type { CoverLetterEntity } from '@/modules/domain/cover-letter/cover-letter.entity';

/**
 * JSON-safe cover letter DTO for Client Components.
 */
export interface CoverLetterDto {
  id: string;
  jobId: string;
  resumeId: string;
  content: string;
  locale: CoverLetterEntity['locale'];
  model: string | null;
  promptVersion: string | null;
  createdAt: string;
}

/**
 * Maps a CoverLetter entity to a serializable DTO.
 */
export function toCoverLetterDto(letter: CoverLetterEntity): CoverLetterDto {
  return {
    id: letter.id,
    jobId: letter.jobId,
    resumeId: letter.resumeId,
    content: letter.content,
    locale: letter.locale,
    model: letter.model,
    promptVersion: letter.promptVersion,
    createdAt: letter.createdAt.toISOString(),
  };
}
