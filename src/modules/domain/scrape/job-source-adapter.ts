import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';
import type { SourceTypeValue } from '@/modules/domain/company/company-seed.repository';
import type { NormalizedJobDto } from '@/shared/schemas/scrape.schema';

export interface ScrapeSourceInput {
  id: string;
  name: string;
  baseUrl: string;
  atsType: AtsTypeValue | null;
  enabled: boolean;
  companyName: string | null;
  country: string | null;
  type?: SourceTypeValue;
  config?: unknown;
}


/**
 * Port implemented by ATS/scraper adapters.
 */
export interface JobSourceAdapter {
  readonly key: string;
  readonly atsTypes: readonly AtsTypeValue[];
  supports(source: ScrapeSourceInput): boolean;
  fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]>;
}
