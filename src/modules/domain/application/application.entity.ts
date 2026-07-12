export type ApplicationStatusValue =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PENDING_APPLY'
  | 'APPLIED'
  | 'FAILED'
  | 'MANUAL_REQUIRED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'OFFER'
  | 'WITHDRAWN';

/**
 * Application aggregate for the apply workflow.
 */
export interface ApplicationEntity {
  readonly id: string;
  readonly jobId: string;
  readonly userId: string;
  readonly resumeId: string;
  readonly coverLetterId: string | null;
  readonly status: ApplicationStatusValue;
  readonly approvedAt: Date | null;
  readonly appliedAt: Date | null;
  readonly failureCode: string | null;
  readonly failureMessage: string | null;
  readonly provider: string | null;
  readonly externalReference: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly jobTitle: string;
  readonly companyName: string | null;
  readonly applyUrl: string;
  readonly resumeName: string;
}

/**
 * Manual transitions available in the UI before Playwright auto-apply.
 */
export const MANUAL_APPLICATION_TRANSITIONS = [
  'APPROVED',
  'PENDING_APPLY',
  'APPLIED',
  'MANUAL_REQUIRED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
] as const;

export type ManualApplicationTransition = (typeof MANUAL_APPLICATION_TRANSITIONS)[number];
