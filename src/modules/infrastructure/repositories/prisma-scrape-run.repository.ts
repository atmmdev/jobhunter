import type {
  ScrapeRunListItem,
  ScrapeRunRepository,
} from '@/modules/domain/scrape/scrape-run.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

/**
 * Prisma implementation for scrape run history.
 */
export class PrismaScrapeRunRepository implements ScrapeRunRepository {
  async listRecent(limit: number): Promise<ScrapeRunListItem[]> {
    const runs = await prisma.scrapeRun.findMany({
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: {
        source: { select: { name: true } },
      },
    });

    return runs.map((run) => ({
      id: run.id,
      sourceId: run.sourceId,
      sourceName: run.source.name,
      status: run.status,
      jobsFound: run.jobsFound,
      jobsUpserted: run.jobsUpserted,
      errorSummary: run.errorSummary,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
    }));
  }
}
