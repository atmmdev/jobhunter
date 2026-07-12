import type { JobEntity, JobStatusValue, ManualJobStatus } from '@/modules/domain/job/job.entity';

export interface CreateJobPersistInput {
  sourceId: string;
  companyId?: string | null;
  externalId?: string | null;
  title: string;
  descriptionText: string;
  location?: string | null;
  country?: string | null;
  isRemote?: boolean | null;
  employmentType?: string | null;
  seniority?: string | null;
  salaryRaw?: string | null;
  applyUrl: string;
  contentHash: string;
  status?: JobStatusValue;
}

export interface ListJobsFilter {
  status?: JobStatusValue;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListJobsResult {
  items: JobEntity[];
  total: number;
}

/**
 * Persistence port for the Job aggregate.
 */
export interface JobRepository {
  findById(id: string): Promise<JobEntity | null>;
  list(filter: ListJobsFilter): Promise<ListJobsResult>;
  create(input: CreateJobPersistInput): Promise<JobEntity>;
  updateStatus(id: string, status: ManualJobStatus): Promise<JobEntity>;
}
