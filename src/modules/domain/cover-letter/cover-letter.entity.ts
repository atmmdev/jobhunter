import type { AppLocale } from '@/modules/domain/user/user.entity';

/**
 * Cover letter aggregate linked to a job, resume, and optionally an application.
 */
export interface CoverLetterEntity {
  readonly id: string;
  readonly userId: string;
  readonly jobId: string;
  readonly resumeId: string;
  readonly content: string;
  readonly locale: AppLocale;
  readonly model: string | null;
  readonly promptVersion: string | null;
  readonly createdAt: Date;
}
