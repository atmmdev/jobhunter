import type { ResumeEntity, ResumeStackValue } from '@/modules/domain/resume/resume.entity';

export interface CreateResumePersistInput {
  userId: string;
  name: string;
  stack: ResumeStackValue;
  summary?: string | null;
  contentText: string;
  isActive?: boolean;
}

export interface UpdateResumePersistInput {
  name?: string;
  stack?: ResumeStackValue;
  summary?: string | null;
  contentText?: string;
  isActive?: boolean;
}

/**
 * Persistence port for the Resume aggregate.
 */
export interface ResumeRepository {
  findById(id: string): Promise<ResumeEntity | null>;
  listByUser(userId: string): Promise<ResumeEntity[]>;
  create(input: CreateResumePersistInput): Promise<ResumeEntity>;
  update(id: string, input: UpdateResumePersistInput): Promise<ResumeEntity>;
  delete(id: string): Promise<void>;
}
