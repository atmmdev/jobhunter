import type { CompanySeedRepository, SourceListRow } from '@/modules/domain/company/company-seed.repository';
import type { SetSourceEnabledDto } from '@/shared/schemas/source-enabled.schema';

/**
 * Enables or disables a crawl source.
 */
export class SetSourceEnabledService {
  constructor(private readonly seeds: CompanySeedRepository) {}

  async execute(input: SetSourceEnabledDto): Promise<SourceListRow> {
    return this.seeds.setEnabled(input.sourceId, input.enabled);
  }
}
