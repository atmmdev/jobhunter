import type { SourceRunStatusValue } from '@/modules/domain/scrape/scrape-persistence.repository';

/**
 * JSON-safe scrape run DTO.
 */
export interface ScrapeRunListItemDto {
  id: string;
  sourceId: string;
  sourceName: string;
  status: SourceRunStatusValue;
  jobsFound: number;
  jobsUpserted: number;
  errorSummary: string | null;
  startedAt: string;
  finishedAt: string | null;
}

/**
 * Maps scrape run entity to a serializable DTO.
 */
export function toScrapeRunListItemDto(run: {
  id: string;
  sourceId: string;
  sourceName: string;
  status: SourceRunStatusValue;
  jobsFound: number;
  jobsUpserted: number;
  errorSummary: string | null;
  startedAt: Date;
  finishedAt: Date | null;
}): ScrapeRunListItemDto {
  return {
    id: run.id,
    sourceId: run.sourceId,
    sourceName: run.sourceName,
    status: run.status,
    jobsFound: run.jobsFound,
    jobsUpserted: run.jobsUpserted,
    errorSummary: run.errorSummary,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
  };
}
