import type { AppLocale } from '@/modules/domain/user/user.entity';
import type { ResumeEntity, ResumeStackValue } from '@/modules/domain/resume/resume.entity';

/**
 * JSON-safe resume DTO for Client Components.
 */
export interface ResumeListItemDto {
  id: string;
  userId: string;
  name: string;
  stack: ResumeStackValue;
  locale: AppLocale;
  summary: string | null;
  contentText: string;
  filePath: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps a Resume entity to a serializable list DTO.
 */
export function toResumeListItemDto(resume: ResumeEntity): ResumeListItemDto {
  return {
    id: resume.id,
    userId: resume.userId,
    name: resume.name,
    stack: resume.stack,
    locale: resume.locale,
    summary: resume.summary,
    contentText: resume.contentText,
    filePath: resume.filePath,
    isActive: resume.isActive,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };
}
