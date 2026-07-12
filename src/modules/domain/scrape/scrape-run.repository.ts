export interface ScrapeRunListItem {
  id: string;
  sourceId: string;
  sourceName: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  jobsFound: number;
  jobsUpserted: number;
  errorSummary: string | null;
  startedAt: Date;
  finishedAt: Date | null;
}

/**
 * Persistence port for scrape run history.
 */
export interface ScrapeRunRepository {
  listRecent(limit: number): Promise<ScrapeRunListItem[]>;
}
