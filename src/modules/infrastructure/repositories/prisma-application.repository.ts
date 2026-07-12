import type { Application as PrismaApplication, Job, Resume, Company } from '@prisma/client';

import type {
  ApplicationEntity,
  ApplicationStatusValue,
} from '@/modules/domain/application/application.entity';
import type {
  ApplicationRepository,
  CreateApplicationInput,
  ListApplicationsFilter,
  ListApplicationsResult,
  TransitionApplicationInput,
} from '@/modules/domain/application/application.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

type ApplicationWithRelations = PrismaApplication & {
  job: Pick<Job, 'title' | 'applyUrl' | 'companyId'> & {
    company: Pick<Company, 'name'> | null;
  };
  resume: Pick<Resume, 'name'>;
};

function mapApplication(row: ApplicationWithRelations): ApplicationEntity {
  return {
    id: row.id,
    jobId: row.jobId,
    userId: row.userId,
    resumeId: row.resumeId,
    coverLetterId: row.coverLetterId,
    status: row.status as ApplicationStatusValue,
    approvedAt: row.approvedAt,
    appliedAt: row.appliedAt,
    failureCode: row.failureCode,
    failureMessage: row.failureMessage,
    provider: row.provider,
    externalReference: row.externalReference,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    jobTitle: row.job.title,
    companyName: row.job.company?.name ?? null,
    applyUrl: row.job.applyUrl,
    resumeName: row.resume.name,
  };
}

const applicationInclude = {
  job: {
    select: {
      title: true,
      applyUrl: true,
      companyId: true,
      company: { select: { name: true } },
    },
  },
  resume: { select: { name: true } },
} as const;

/**
 * Prisma implementation of the Application repository port.
 */
export class PrismaApplicationRepository implements ApplicationRepository {
  async findById(id: string): Promise<ApplicationEntity | null> {
    const row = await prisma.application.findUnique({
      where: { id },
      include: applicationInclude,
    });
    return row ? mapApplication(row) : null;
  }

  async findByUserAndJob(userId: string, jobId: string): Promise<ApplicationEntity | null> {
    const row = await prisma.application.findFirst({
      where: { userId, jobId },
      include: applicationInclude,
    });
    return row ? mapApplication(row) : null;
  }

  async list(filter: ListApplicationsFilter): Promise<ListApplicationsResult> {
    const where = {
      userId: filter.userId,
      ...(filter.status ? { status: filter.status } : {}),
    };
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const [items, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: applicationInclude,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      items: items.map(mapApplication),
      total,
    };
  }

  async create(input: CreateApplicationInput): Promise<ApplicationEntity> {
    const row = await prisma.application.create({
      data: {
        jobId: input.jobId,
        userId: input.userId,
        resumeId: input.resumeId,
        status: input.status,
        approvedAt: input.approvedAt ?? null,
      },
      include: applicationInclude,
    });
    return mapApplication(row);
  }

  async transition(input: TransitionApplicationInput): Promise<ApplicationEntity> {
    const row = await prisma.application.update({
      where: { id: input.id },
      data: {
        status: input.status,
        ...(input.approvedAt !== undefined ? { approvedAt: input.approvedAt } : {}),
        ...(input.appliedAt !== undefined ? { appliedAt: input.appliedAt } : {}),
        ...(input.failureCode !== undefined ? { failureCode: input.failureCode } : {}),
        ...(input.failureMessage !== undefined ? { failureMessage: input.failureMessage } : {}),
      },
      include: applicationInclude,
    });
    return mapApplication(row);
  }
}
