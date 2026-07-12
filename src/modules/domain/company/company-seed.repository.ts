import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';

export type SourceTypeValue =
  | 'ATS'
  | 'CAREERS'
  | 'JOB_BOARD'
  | 'TELEGRAM'
  | 'SLACK'
  | 'OTHER';

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

/**
 * Persistence port for company seed sync.
 */
export interface CompanySeedRepository {
  upsertFromSeed(input: UpsertCompanyFromSeedInput): Promise<UpsertCompanyFromSeedResult>;
  listSources(): Promise<SourceListRow[]>;
}
