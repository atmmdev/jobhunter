import { assertApplicationTransition } from '@/modules/domain/application/application-status.policy';
import type { ApplicationRepository } from '@/modules/domain/application/application.repository';
import type { BrowserService } from '@/modules/domain/apply/browser-service';
import type { AuditLogRepository } from '@/modules/domain/audit/audit-log.repository';
import type { CoverLetterRepository } from '@/modules/domain/cover-letter/cover-letter.repository';
import type { CredentialVaultRepository } from '@/modules/domain/credential/credential-vault.repository';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import { DomainError, NotFoundError } from '@/modules/domain/shared/errors';
import type { UserRepository } from '@/modules/domain/user/user.repository';
import type { ApplyArtifactStore } from '@/modules/infrastructure/apply/apply-artifact-store';
import type { ApplyStrategyRegistry } from '@/modules/infrastructure/apply/apply-strategy-registry';
import { materializeResumeFile } from '@/modules/infrastructure/apply/materialize-resume-file';
import { detectAtsType } from '@/modules/infrastructure/ats/detect-ats-type';
import type {
  AutoApplyResult,
  ExecuteAutoApplyDto,
} from '@/shared/schemas/auto-apply.schema';

export interface ExecuteAutoApplyResult {
  applicationId: string;
  result: AutoApplyResult;
}

/**
 * Runs Playwright auto-apply for an approved / pending application.
 */
export class ExecuteAutoApplyService {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly jobs: JobRepository,
    private readonly resumes: ResumeRepository,
    private readonly coverLetters: CoverLetterRepository,
    private readonly users: UserRepository,
    private readonly vault: CredentialVaultRepository,
    private readonly browser: BrowserService,
    private readonly strategies: ApplyStrategyRegistry,
    private readonly artifacts: ApplyArtifactStore,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(userId: string, input: ExecuteAutoApplyDto): Promise<ExecuteAutoApplyResult> {
    if (process.env.PLAYWRIGHT_AUTO_APPLY_ENABLED === 'false') {
      throw new DomainError('AUTO_APPLY_DISABLED', 'Auto-apply is disabled by configuration');
    }

    const application = await this.applications.findById(input.applicationId);
    if (!application || application.userId !== userId) {
      throw new NotFoundError('Application', input.applicationId);
    }

    if (!['APPROVED', 'PENDING_APPLY', 'FAILED', 'MANUAL_REQUIRED'].includes(application.status)) {
      throw new DomainError(
        'INVALID_STATUS',
        `Cannot auto-apply from status ${application.status}`,
      );
    }

    const job = await this.jobs.findById(application.jobId);
    if (!job) {
      throw new NotFoundError('Job', application.jobId);
    }

    const resume = await this.resumes.findById(application.resumeId);
    if (!resume || resume.userId !== userId) {
      throw new NotFoundError('Resume', application.resumeId);
    }

    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const coverLetter = application.coverLetterId
      ? await this.coverLetters.findById(application.coverLetterId)
      : null;

    if (application.status !== 'PENDING_APPLY') {
      assertApplicationTransition(application.status, 'PENDING_APPLY');
      await this.applications.transition({
        id: application.id,
        status: 'PENDING_APPLY',
      });
    }

    const strategyJob = {
      applicationId: application.id,
      jobId: job.id,
      applyUrl: job.applyUrl,
      jobTitle: job.title,
      companyName: job.companyName,
      atsHint: detectAtsType(job.applyUrl),
    };

    const strategy = this.strategies.resolve(strategyJob);
    if (!strategy) {
      const result: AutoApplyResult = {
        status: 'MANUAL_REQUIRED',
        reason: 'No apply strategy registered for this job URL',
        provider: 'none',
        artifactPaths: [],
      };
      await this.persistResult(userId, application.id, application.jobId, result);
      return { applicationId: application.id, result };
    }

    const artifactsDir = await this.artifacts.ensureDir(application.id);
    const allowSubmit = process.env.PLAYWRIGHT_AUTO_SUBMIT === 'true';
    const resumeFilePath = await materializeResumeFile({
      resumeFilePath: resume.filePath,
      resumeText: resume.contentText,
      artifactsDir,
      preferredName: resume.name,
    });
    const storageStateJson = await this.resolveStorageState(userId, job.applyUrl);
    const session = await this.browser.launchSession({
      storageStateJson: storageStateJson ?? undefined,
    });

    let result: AutoApplyResult;
    try {
      result = await strategy.apply(
        {
          job: strategyJob,
          candidate: {
            fullName: user.name?.trim() || user.email.split('@')[0] || 'Candidate',
            email: user.email,
            phone: null,
            linkedInUrl: null,
            location: null,
            resumeText: resume.contentText,
            resumeFilePath,
            coverLetter: coverLetter?.content ?? null,
          },
          allowSubmit,
          artifactsDir,
        },
        session.page,
      );
    } finally {
      await session.close();
    }

    await this.persistResult(userId, application.id, application.jobId, result);
    return { applicationId: application.id, result };
  }

  private async resolveStorageState(userId: string, applyUrl: string): Promise<string | null> {
    const host = (() => {
      try {
        return new URL(applyUrl).hostname.toLowerCase();
      } catch {
        return '';
      }
    })();

    const candidates: string[] = [];
    if (host.includes('linkedin.com')) {
      candidates.push('linkedin');
    }
    if (host.includes('indeed.com')) {
      candidates.push('indeed');
    }
    candidates.push('generic');

    for (const provider of candidates) {
      const secret = await this.vault.getSecret(userId, provider);
      if (secret) {
        return secret;
      }
    }
    return null;
  }

  private async persistResult(
    userId: string,
    applicationId: string,
    jobId: string,
    result: AutoApplyResult,
  ): Promise<void> {
    if (result.status === 'APPLIED') {
      assertApplicationTransition('PENDING_APPLY', 'APPLIED');
      await this.applications.transition({
        id: applicationId,
        status: 'APPLIED',
        appliedAt: new Date(),
        failureCode: null,
        failureMessage: null,
        provider: result.provider,
        externalReference: result.externalReference ?? null,
      });
      await this.jobs.setStatus(jobId, 'APPLIED');
    } else if (result.status === 'MANUAL_REQUIRED') {
      assertApplicationTransition('PENDING_APPLY', 'MANUAL_REQUIRED');
      await this.applications.transition({
        id: applicationId,
        status: 'MANUAL_REQUIRED',
        failureCode: 'MANUAL_REQUIRED',
        failureMessage: result.reason,
        provider: result.provider,
      });
    } else {
      assertApplicationTransition('PENDING_APPLY', 'FAILED');
      await this.applications.transition({
        id: applicationId,
        status: 'FAILED',
        failureCode: result.code,
        failureMessage: result.message,
        provider: result.provider,
      });
    }

    await this.audit.create({
      actorType: 'SYSTEM',
      actorId: userId,
      action: 'application.auto_apply',
      entityType: 'Application',
      entityId: applicationId,
      metadata: {
        status: result.status,
        provider: result.provider,
        artifactPaths: result.artifactPaths,
      },
    });
  }
}
