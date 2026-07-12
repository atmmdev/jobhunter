import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';
import type { SourceTypeValue } from '@/modules/domain/company/company-seed.repository';
import type { ScrapeSourceInput } from '@/modules/domain/scrape/job-source-adapter';

export type SourceRunStatusValue = 'SUCCESS' | 'PARTIAL' | 'FAILED';

export interface SourceForScrape extends ScrapeSourceInput {
  companyId: string | null;
  type: SourceTypeValue;
}

export interface CreateScrapeRunInput {
  sourceId: string;
  status: SourceRunStatusValue;
  jobsFound: number;
  jobsUpserted: number;
  errorSummary?: string | null;
  startedAt: Date;
  finishedAt: Date;
}

/**
 * Persistence helpers for scrape orchestration.
 */
export interface ScrapePersistenceRepository {
  findSourceById(id: string): Promise<SourceForScrape | null>;
  listEnabledForScrape(): Promise<SourceForScrape[]>;
  markSourceRun(
    sourceId: string,
    status: SourceRunStatusValue,
    ranAt: Date,
  ): Promise<void>;
  createScrapeRun(input: CreateScrapeRunInput): Promise<{ id: string }>;
}
