import { NotFoundError, ValidationError } from '@/modules/domain/shared/errors';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { JobSourceAdapterRegistry } from '@/modules/infrastructure/scrapers/adapter-registry';
import type { ScrapePersistenceRepository } from '@/modules/domain/scrape/scrape-persistence.repository';
import { scrapeConcurrencyGuard } from '@/modules/infrastructure/scrape/scrape-concurrency-guard';
import { isNearDuplicate } from '@/modules/domain/scoring/semantic-dedupe.policy';
import { buildJobContentHash } from '@/shared/lib/job-content-hash';
import { createCorrelationId, rootLogger } from '@/shared/logging/logger';
import type { RunSourceDto } from '@/shared/schemas/scrape.schema';
import { prisma } from '@/modules/infrastructure/prisma/client';

export interface RunSourceScrapeResult {
  sourceId: string;
  adapterKey: string;
  jobsFound: number;
  jobsCreated: number;
  jobsUpdated: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  errorSummary: string | null;
  correlationId: string;
}

/**
 * Runs a single source scrape through the matching ATS adapter and upserts jobs.
 */
export class RunSourceScrapeService {
  constructor(
    private readonly persistence: ScrapePersistenceRepository,
    private readonly jobs: JobRepository,
    private readonly adapters: JobSourceAdapterRegistry,
  ) {}

  async execute(input: RunSourceDto): Promise<RunSourceScrapeResult> {
    return scrapeConcurrencyGuard.runExclusive(input.sourceId, () => this.executeUnlocked(input));
  }

  private async executeUnlocked(input: RunSourceDto): Promise<RunSourceScrapeResult> {
    const correlationId = createCorrelationId('scrape');
    const log = rootLogger.child({ correlationId, sourceId: input.sourceId });

    const source = await this.persistence.findSourceById(input.sourceId);
    if (!source) {
      throw new NotFoundError('Source', input.sourceId);
    }
    if (!source.enabled) {
      throw new ValidationError('Source is disabled');
    }

    const adapter = this.adapters.resolve(source);
    if (!adapter) {
      throw new ValidationError(
        `No scraper adapter for ATS ${source.atsType ?? 'UNKNOWN'} (${source.baseUrl})`,
      );
    }

    log.info('scrape.started', { adapter: adapter.key, atsType: source.atsType });

    const startedAt = new Date();
    let jobsFound = 0;
    let jobsCreated = 0;
    let jobsUpdated = 0;
    let errorSummary: string | null = null;
    let status: 'SUCCESS' | 'PARTIAL' | 'FAILED' = 'SUCCESS';

    try {
      const normalizedJobs = await adapter.fetchJobs(source);
      jobsFound = normalizedJobs.length;

      const recentJobs = await prisma.job.findMany({
        where: { sourceId: source.id },
        select: { title: true, descriptionText: true },
        orderBy: { scrapedAt: 'desc' },
        take: 80,
      });

      for (const job of normalizedJobs) {
        if (!job.externalId) {
          continue;
        }

        const haystack = `${job.title}\n${job.descriptionText}`;
        const nearDuplicate = recentJobs.some((existing) =>
          isNearDuplicate(haystack, `${existing.title}\n${existing.descriptionText}`),
        );
        if (nearDuplicate) {
          continue;
        }

        const contentHash = buildJobContentHash({
          title: job.title,
          applyUrl: job.applyUrl,
          descriptionText: job.descriptionText,
          companyName: job.companyName ?? source.companyName,
        });

        const result = await this.jobs.upsertByExternalId({
          sourceId: source.id,
          companyId: source.companyId,
          externalId: job.externalId,
          title: job.title,
          descriptionText: job.descriptionText,
          descriptionHtml: job.descriptionHtml ?? null,
          applyUrl: job.applyUrl,
          location: job.location ?? null,
          country: job.country ?? source.country,
          isRemote: job.isRemote ?? null,
          employmentType: job.employmentType ?? null,
          seniority: job.seniority ?? null,
          salaryRaw: job.salaryRaw ?? null,
          postedAt: job.postedAt ?? null,
          contentHash,
          status: 'NEW',
        });

        if (result.created) {
          jobsCreated += 1;
          recentJobs.unshift({
            title: job.title,
            descriptionText: job.descriptionText,
          });
        } else {
          jobsUpdated += 1;
        }
      }
    } catch (error) {
      status = 'FAILED';
      errorSummary = error instanceof Error ? error.message : 'Unknown scrape error';
      log.error('scrape.failed', { error: errorSummary });
    }

    if (status !== 'FAILED' && jobsFound > 0 && jobsCreated + jobsUpdated < jobsFound) {
      status = 'PARTIAL';
    }

    const finishedAt = new Date();
    await this.persistence.createScrapeRun({
      sourceId: source.id,
      status,
      jobsFound,
      jobsUpserted: jobsCreated + jobsUpdated,
      errorSummary,
      startedAt,
      finishedAt,
    });
    await this.persistence.markSourceRun(source.id, status, finishedAt);

    log.info('scrape.finished', {
      status,
      jobsFound,
      jobsCreated,
      jobsUpdated,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
    });

    if (status === 'FAILED') {
      throw new ValidationError(errorSummary ?? 'Scrape failed');
    }

    return {
      sourceId: source.id,
      adapterKey: adapter.key,
      jobsFound,
      jobsCreated,
      jobsUpdated,
      status,
      errorSummary,
      correlationId,
    };
  }
}
