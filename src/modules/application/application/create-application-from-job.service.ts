import type { ApplicationEntity } from '@/modules/domain/application/application.entity';
import type { ApplicationRepository } from '@/modules/domain/application/application.repository';
import type { AuditLogRepository } from '@/modules/domain/audit/audit-log.repository';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import { ConflictError, NotFoundError, ValidationError } from '@/modules/domain/shared/errors';
import { prisma } from '@/modules/infrastructure/prisma/client';

/**
 * Creates an application from a job using the recommended (or first active) resume.
 */
export class CreateApplicationFromJobService {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly jobs: JobRepository,
    private readonly resumes: ResumeRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(userId: string, jobId: string, resumeId?: string): Promise<ApplicationEntity> {
    const job = await this.jobs.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job', jobId);
    }

    if (job.status === 'REJECTED' || job.status === 'CLOSED') {
      throw new ValidationError(`Cannot create application for job in status ${job.status}`);
    }

    const existing = await this.applications.findByUserAndJob(userId, jobId);
    if (existing) {
      throw new ConflictError('An application already exists for this job');
    }

    const activeResumes = (await this.resumes.listByUser(userId)).filter((r) => r.isActive);
    if (activeResumes.length === 0) {
      throw new ValidationError('Create an active resume before approving a job');
    }

    let chosenResumeId = resumeId;
    if (!chosenResumeId) {
      const recommended = await prisma.jobResumeMatch.findFirst({
        where: { jobId, isRecommended: true, resume: { userId, isActive: true } },
        select: { resumeId: true },
      });
      chosenResumeId = recommended?.resumeId ?? activeResumes[0]?.id;
    }

    const resume = activeResumes.find((r) => r.id === chosenResumeId);
    if (!resume) {
      throw new NotFoundError('Resume', chosenResumeId);
    }

    const application = await this.applications.create({
      jobId,
      userId,
      resumeId: resume.id,
      status: 'PENDING_APPROVAL',
    });

    await this.jobs.setStatus(jobId, 'APPROVED');

    await this.audit.create({
      actorType: 'USER',
      actorId: userId,
      action: 'application.created',
      entityType: 'Application',
      entityId: application.id,
      metadata: { jobId, resumeId: resume.id, status: application.status },
    });

    return application;
  }
}
