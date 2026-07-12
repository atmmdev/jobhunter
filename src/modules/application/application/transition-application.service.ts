import {
  assertApplicationTransition,
} from '@/modules/domain/application/application-status.policy';
import type { ApplicationEntity } from '@/modules/domain/application/application.entity';
import type { ApplicationRepository } from '@/modules/domain/application/application.repository';
import type { AuditLogRepository } from '@/modules/domain/audit/audit-log.repository';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { JobStatusValue } from '@/modules/domain/job/job.entity';
import { NotFoundError } from '@/modules/domain/shared/errors';
import type { TransitionApplicationDto } from '@/shared/schemas/application.schema';

const JOB_STATUS_BY_APPLICATION: Partial<Record<string, JobStatusValue>> = {
  APPROVED: 'APPROVED',
  APPLIED: 'APPLIED',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
};

/**
 * Transitions an application through the allowed status machine and audits the change.
 */
export class TransitionApplicationService {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly jobs: JobRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(userId: string, input: TransitionApplicationDto): Promise<ApplicationEntity> {
    const existing = await this.applications.findById(input.applicationId);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError('Application', input.applicationId);
    }

    assertApplicationTransition(existing.status, input.status);

    const now = new Date();
    const application = await this.applications.transition({
      id: existing.id,
      status: input.status,
      approvedAt:
        input.status === 'APPROVED' && !existing.approvedAt ? now : existing.approvedAt,
      appliedAt: input.status === 'APPLIED' && !existing.appliedAt ? now : existing.appliedAt,
    });

    const jobStatus = JOB_STATUS_BY_APPLICATION[input.status];
    if (jobStatus) {
      await this.jobs.setStatus(existing.jobId, jobStatus);
    }

    await this.audit.create({
      actorType: 'USER',
      actorId: userId,
      action: 'application.transition',
      entityType: 'Application',
      entityId: application.id,
      metadata: { from: existing.status, to: input.status },
    });

    return application;
  }
}
