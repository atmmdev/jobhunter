import type { JobEntity, JobStatusValue } from '@/modules/domain/job/job.entity';

/**
 * JSON-safe job DTO for Client Components.
 */
export interface JobListItemDto {
  id: string;
  companyId: string | null;
  companyName: string | null;
  sourceId: string;
  sourceName: string;
  externalId: string | null;
  title: string;
  descriptionText: string;
  location: string | null;
  country: string | null;
  isRemote: boolean | null;
  employmentType: string | null;
  seniority: string | null;
  salaryRaw: string | null;
  applyUrl: string;
  postedAt: string | null;
  scrapedAt: string;
  contentHash: string;
  status: JobStatusValue;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps a Job entity to a serializable list DTO.
 */
export function toJobListItemDto(job: JobEntity): JobListItemDto {
  return {
    id: job.id,
    companyId: job.companyId,
    companyName: job.companyName,
    sourceId: job.sourceId,
    sourceName: job.sourceName,
    externalId: job.externalId,
    title: job.title,
    descriptionText: job.descriptionText,
    location: job.location,
    country: job.country,
    isRemote: job.isRemote,
    employmentType: job.employmentType,
    seniority: job.seniority,
    salaryRaw: job.salaryRaw,
    applyUrl: job.applyUrl,
    postedAt: job.postedAt?.toISOString() ?? null,
    scrapedAt: job.scrapedAt.toISOString(),
    contentHash: job.contentHash,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
