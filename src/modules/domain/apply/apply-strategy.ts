import type { AutoApplyResult } from '@/shared/schemas/auto-apply.schema';

/**
 * Candidate profile fields mapped into ATS apply forms.
 */
export interface ApplyCandidateProfile {
  fullName: string;
  email: string;
  phone: string | null;
  linkedInUrl: string | null;
  location: string | null;
  resumeText: string;
  resumeFilePath: string | null;
  coverLetter: string | null;
}

/**
 * Job + application context passed to apply strategies.
 */
export interface ApplyJobContext {
  applicationId: string;
  jobId: string;
  applyUrl: string;
  jobTitle: string;
  companyName: string | null;
  atsHint: string | null;
}

export interface ApplyStrategyInput {
  job: ApplyJobContext;
  candidate: ApplyCandidateProfile;
  /** When false, strategies fill forms but do not click submit. */
  allowSubmit: boolean;
  artifactsDir: string;
}

/**
 * Port implemented by ATS/site apply strategies (Playwright).
 */
export interface ApplyStrategy {
  readonly key: string;
  supports(job: ApplyJobContext): boolean;
  apply(input: ApplyStrategyInput, page: unknown): Promise<AutoApplyResult>;
}
