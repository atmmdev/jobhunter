import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';
import type { SourceTypeValue } from '@/modules/domain/company/company-seed.repository';
import type {
  CreateScrapeRunInput,
  ScrapePersistenceRepository,
  SourceForScrape,
  SourceRunStatusValue,
} from '@/modules/domain/scrape/scrape-persistence.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

/**
 * Prisma persistence for scrape runs and source metadata updates.
 */
export class PrismaScrapePersistenceRepository implements ScrapePersistenceRepository {
  async findSourceById(id: string): Promise<SourceForScrape | null> {
    const source = await prisma.source.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, country: true } },
      },
    });

    if (!source) {
      return null;
    }

    return {
      id: source.id,
      name: source.name,
      baseUrl: source.baseUrl,
      atsType: source.atsType as AtsTypeValue | null,
      enabled: source.enabled,
      companyId: source.companyId,
      companyName: source.company?.name ?? null,
      country: source.company?.country ?? null,
      type: source.type as SourceTypeValue,
    };
  }

  async listEnabledForScrape(): Promise<SourceForScrape[]> {
    const sources = await prisma.source.findMany({
      where: { enabled: true },
      include: {
        company: { select: { id: true, name: true, country: true } },
      },
      orderBy: { name: 'asc' },
    });

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      baseUrl: source.baseUrl,
      atsType: source.atsType as AtsTypeValue | null,
      enabled: source.enabled,
      companyId: source.companyId,
      companyName: source.company?.name ?? null,
      country: source.company?.country ?? null,
      type: source.type as SourceTypeValue,
    }));
  }

  async markSourceRun(
    sourceId: string,
    status: SourceRunStatusValue,
    ranAt: Date,
  ): Promise<void> {
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        lastRunAt: ranAt,
        lastStatus: status,
      },
    });
  }

  async createScrapeRun(input: CreateScrapeRunInput): Promise<{ id: string }> {
    const run = await prisma.scrapeRun.create({
      data: {
        sourceId: input.sourceId,
        status: input.status,
        jobsFound: input.jobsFound,
        jobsUpserted: input.jobsUpserted,
        errorSummary: input.errorSummary ?? null,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
      },
    });
    return { id: run.id };
  }
}
