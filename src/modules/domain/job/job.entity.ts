export type JobStatusValue =
  | 'NEW'
  | 'SCORED'
  | 'FAVORITED'
  | 'REJECTED'
  | 'APPROVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'CLOSED';

/**
 * Job aggregate used by the application layer.
 */
export interface JobEntity {
  readonly id: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly sourceId: string;
  readonly sourceName: string;
  readonly externalId: string | null;
  readonly title: string;
  readonly descriptionText: string;
  readonly location: string | null;
  readonly country: string | null;
  readonly isRemote: boolean | null;
  readonly employmentType: string | null;
  readonly seniority: string | null;
  readonly salaryRaw: string | null;
  readonly applyUrl: string;
  readonly postedAt: Date | null;
  readonly scrapedAt: Date;
  readonly contentHash: string;
  readonly status: JobStatusValue;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const MANUAL_JOB_TRANSITIONS = ['FAVORITED', 'REJECTED', 'NEW'] as const;

export type ManualJobStatus = (typeof MANUAL_JOB_TRANSITIONS)[number];
