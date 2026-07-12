import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';

export type SourceTypeValue =
  | 'ATS'
  | 'CAREERS'
  | 'JOB_BOARD'
  | 'TELEGRAM'
  | 'SLACK'
  | 'OTHER';

export type SourceSortByValue =
  | 'name'
  | 'company'
  | 'ats'
  | 'country'
  | 'enabled'
  | 'url';

export type SortDirection = 'asc' | 'desc';

export interface UpsertCompanyFromSeedInput {
  name: string;
  careersUrl: string;
  country: string | null;
  atsType: AtsTypeValue;
  sourceMeta: {
    fileName: string;
    importedAt: string;
  };
}

export interface UpsertCompanyFromSeedResult {
  companyId: string;
  created: boolean;
  sourceId: string;
  sourceCreated: boolean;
}

export interface SourceListRow {
  id: string;
  name: string;
  type: SourceTypeValue;
  atsType: AtsTypeValue | null;
  baseUrl: string;
  enabled: boolean;
  companyName: string | null;
  country: string | null;
  lastRunAt: Date | null;
  lastStatus: string | null;
  createdAt: Date;
}

export interface ListSourcesFilter {
  page: number;
  pageSize: number;
  sortBy: SourceSortByValue;
  sortDir: SortDirection;
}

export interface ListSourcesResult {
  items: SourceListRow[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Persistence port for company seed sync.
 */
export interface CompanySeedRepository {
  upsertFromSeed(input: UpsertCompanyFromSeedInput): Promise<UpsertCompanyFromSeedResult>;
  listSources(filter: ListSourcesFilter): Promise<ListSourcesResult>;
  setEnabled(sourceId: string, enabled: boolean): Promise<SourceListRow>;
}
