import type { JobEntity } from '@/modules/domain/job/job.entity';
import type { CompanyRepository } from '@/modules/domain/company/company.repository';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { SourceRepository } from '@/modules/domain/source/source.repository';
import { buildJobContentHash } from '@/shared/lib/job-content-hash';
import type { CreateJobDto } from '@/shared/schemas/job.schema';

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

/**
 * Creates a manually entered job under the Manual Entry source.
 */
export class CreateJobService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly sources: SourceRepository,
    private readonly companies: CompanyRepository,
  ) {}

  async execute(input: CreateJobDto): Promise<JobEntity> {
    const source = await this.sources.ensureManualSource();
    const companyName = emptyToNull(input.companyName);
    const company = companyName
      ? await this.companies.findOrCreateByName(companyName)
      : null;

    const contentHash = buildJobContentHash({
      title: input.title,
      applyUrl: input.applyUrl,
      descriptionText: input.descriptionText,
      companyName,
    });

    return this.jobs.create({
      sourceId: source.id,
      companyId: company?.id ?? null,
      title: input.title.trim(),
      descriptionText: input.descriptionText.trim(),
      applyUrl: input.applyUrl.trim(),
      location: emptyToNull(input.location),
      country: emptyToNull(input.country),
      isRemote: input.isRemote ?? null,
      employmentType: emptyToNull(input.employmentType),
      seniority: emptyToNull(input.seniority),
      salaryRaw: emptyToNull(input.salaryRaw),
      contentHash,
      status: 'NEW',
    });
  }
}
