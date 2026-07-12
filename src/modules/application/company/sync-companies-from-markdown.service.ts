import type { CompanySeedRepository } from '@/modules/domain/company/company-seed.repository';
import { detectAtsType } from '@/modules/infrastructure/ats/detect-ats-type';
import {
  loadCompaniesFromDocs,
  type ParsedCompanyRow,
} from '@/modules/infrastructure/companies/parse-companies-markdown';

export interface SyncCompaniesResult {
  totalParsed: number;
  companiesCreated: number;
  companiesUpdated: number;
  sourcesCreated: number;
}

/**
 * Syncs companies and sources from docs/companies-to-work markdown tables.
 */
export class SyncCompaniesFromMarkdownService {
  constructor(private readonly seeds: CompanySeedRepository) {}

  async execute(rows?: ParsedCompanyRow[]): Promise<SyncCompaniesResult> {
    const parsed = rows ?? (await loadCompaniesFromDocs());
    let companiesCreated = 0;
    let companiesUpdated = 0;
    let sourcesCreated = 0;

    for (const row of parsed) {
      const result = await this.seeds.upsertFromSeed({
        name: row.name,
        careersUrl: row.link,
        country: row.countryCode,
        atsType: detectAtsType(row.link),
        sourceMeta: {
          fileName: row.fileName,
          importedAt: new Date().toISOString(),
        },
      });

      if (result.created) {
        companiesCreated += 1;
      } else {
        companiesUpdated += 1;
      }
      if (result.sourceCreated) {
        sourcesCreated += 1;
      }
    }

    return {
      totalParsed: parsed.length,
      companiesCreated,
      companiesUpdated,
      sourcesCreated,
    };
  }
}
