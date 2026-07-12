import type {
  ApplicationEntity,
  ApplicationStatusValue,
} from '@/modules/domain/application/application.entity';

export interface CreateApplicationInput {
  jobId: string;
  userId: string;
  resumeId: string;
  status: ApplicationStatusValue;
  approvedAt?: Date | null;
}

export interface TransitionApplicationInput {
  id: string;
  status: ApplicationStatusValue;
  approvedAt?: Date | null;
  appliedAt?: Date | null;
  failureCode?: string | null;
  failureMessage?: string | null;
}

export interface ListApplicationsFilter {
  userId: string;
  status?: ApplicationStatusValue;
  limit?: number;
  offset?: number;
}

export interface ListApplicationsResult {
  items: ApplicationEntity[];
  total: number;
}

/**
 * Persistence port for the Application aggregate.
 */
export interface ApplicationRepository {
  findById(id: string): Promise<ApplicationEntity | null>;
  findByUserAndJob(userId: string, jobId: string): Promise<ApplicationEntity | null>;
  list(filter: ListApplicationsFilter): Promise<ListApplicationsResult>;
  create(input: CreateApplicationInput): Promise<ApplicationEntity>;
  transition(input: TransitionApplicationInput): Promise<ApplicationEntity>;
}
