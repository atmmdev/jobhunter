import type { Job as PrismaJob, Company, Source } from '@prisma/client';

import type { JobEntity, JobStatusValue } from '@/modules/domain/job/job.entity';
import type {
  CreateJobPersistInput,
  JobRepository,
  ListJobsFilter,
  ListJobsResult,
  UpsertScrapedJobInput,
} from '@/modules/domain/job/job.repository';
import type { ManualJobStatus } from '@/modules/domain/job/job.entity';
import { prisma } from '@/modules/infrastructure/prisma/client';

type JobWithRelations = PrismaJob & {
  company: Pick<Company, 'name'> | null;
  source: Pick<Source, 'name'>;
};

function mapJob(job: JobWithRelations): JobEntity {
  return {
    id: job.id,
    companyId: job.companyId,
    companyName: job.company?.name ?? null,
    sourceId: job.sourceId,
    sourceName: job.source.name,
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
    postedAt: job.postedAt,
    scrapedAt: job.scrapedAt,
    contentHash: job.contentHash,
    status: job.status as JobStatusValue,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

const jobInclude = {
  company: { select: { name: true } },
  source: { select: { name: true } },
} as const;

/**
 * Prisma implementation of the Job repository port.
 */
export class PrismaJobRepository implements JobRepository {
  async findById(id: string): Promise<JobEntity | null> {
    const job = await prisma.job.findUnique({
      where: { id },
      include: jobInclude,
    });
    return job ? mapJob(job) : null;
  }

  async list(filter: ListJobsFilter): Promise<ListJobsResult> {
    const where = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search
        ? {
            OR: [
              { title: { contains: filter.search } },
              { location: { contains: filter.search } },
              { country: { contains: filter.search } },
              { company: { name: { contains: filter.search } } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        include: jobInclude,
        orderBy: { createdAt: 'desc' },
        take: filter.limit ?? 50,
        skip: filter.offset ?? 0,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      items: items.map(mapJob),
      total,
    };
  }

  async create(input: CreateJobPersistInput): Promise<JobEntity> {
    const job = await prisma.job.create({
      data: {
        sourceId: input.sourceId,
        companyId: input.companyId ?? null,
        externalId: input.externalId ?? null,
        title: input.title,
        descriptionHtml: input.descriptionHtml ?? null,
        descriptionText: input.descriptionText,
        location: input.location ?? null,
        country: input.country ?? null,
        isRemote: input.isRemote ?? null,
        employmentType: input.employmentType ?? null,
        seniority: input.seniority ?? null,
        salaryRaw: input.salaryRaw ?? null,
        applyUrl: input.applyUrl,
        contentHash: input.contentHash,
        postedAt: input.postedAt ?? null,
        status: input.status ?? 'NEW',
      },
      include: jobInclude,
    });

    return mapJob(job);
  }

  async updateStatus(id: string, status: ManualJobStatus): Promise<JobEntity> {
    const job = await prisma.job.update({
      where: { id },
      data: { status },
      include: jobInclude,
    });
    return mapJob(job);
  }

  async setStatus(id: string, status: JobStatusValue): Promise<JobEntity> {
    const job = await prisma.job.update({
      where: { id },
      data: { status },
      include: jobInclude,
    });
    return mapJob(job);
  }

  async upsertByExternalId(
    input: UpsertScrapedJobInput,
  ): Promise<{ job: JobEntity; created: boolean }> {
    const existing = await prisma.job.findFirst({
      where: {
        sourceId: input.sourceId,
        externalId: input.externalId,
      },
      include: jobInclude,
    });

    if (existing) {
      const job = await prisma.job.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          descriptionHtml: input.descriptionHtml ?? null,
          descriptionText: input.descriptionText,
          location: input.location ?? null,
          country: input.country ?? null,
          isRemote: input.isRemote ?? null,
          employmentType: input.employmentType ?? null,
          seniority: input.seniority ?? null,
          salaryRaw: input.salaryRaw ?? null,
          applyUrl: input.applyUrl,
          contentHash: input.contentHash,
          postedAt: input.postedAt ?? existing.postedAt,
          scrapedAt: new Date(),
          companyId: input.companyId ?? existing.companyId,
        },
        include: jobInclude,
      });
      return { job: mapJob(job), created: false };
    }

    const job = await this.create(input);
    return { job, created: true };
  }

  async delete(id: string): Promise<void> {
    await prisma.job.delete({ where: { id } });
  }
}
