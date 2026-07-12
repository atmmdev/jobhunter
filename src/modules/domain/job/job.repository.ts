import type { JobEntity, JobStatusValue, ManualJobStatus } from '@/modules/domain/job/job.entity';

export interface CreateJobPersistInput {
  sourceId: string;
  companyId?: string | null;
  externalId?: string | null;
  title: string;
  descriptionText: string;
  descriptionHtml?: string | null;
  location?: string | null;
  country?: string | null;
  isRemote?: boolean | null;
  employmentType?: string | null;
  seniority?: string | null;
  salaryRaw?: string | null;
  applyUrl: string;
  contentHash: string;
  postedAt?: Date | null;
  status?: JobStatusValue;
}

export interface UpsertScrapedJobInput extends CreateJobPersistInput {
  externalId: string;
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
  setStatus(id: string, status: JobStatusValue): Promise<JobEntity>;
  upsertByExternalId(input: UpsertScrapedJobInput): Promise<{ job: JobEntity; created: boolean }>;
  delete(id: string): Promise<void>;
}
