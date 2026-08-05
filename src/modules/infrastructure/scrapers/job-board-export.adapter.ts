import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface ExportJobLike {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  location?: string;
  company?: string;
  remote?: boolean;
  postedAt?: string;
}

/**
 * Cautious LinkedIn/Indeed ingest from exported JSON in source.config.jobs
 * (official APIs require partner access; scraping HTML is intentionally avoided).
 */
export class JobBoardExportAdapter implements JobSourceAdapter {
  readonly key = 'job-board-export';
  readonly atsTypes = ['LINKEDIN', 'INDEED', 'CATHO'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return (
      source.atsType === 'LINKEDIN' ||
      source.atsType === 'INDEED' ||
      source.atsType === 'CATHO' ||
      /linkedin\.com|indeed\.com|catho\.com/i.test(source.baseUrl)
    );
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const config = source.config;
    const jobs =
      config && typeof config === 'object' && config !== null
        ? (config as { jobs?: ExportJobLike[] }).jobs
        : undefined;

    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new Error(
        `${source.atsType ?? 'Job board'} sources require source.config.jobs[] export JSON (no public scrape)`,
      );
    }

    const board = (source.atsType ?? 'CUSTOM').toLowerCase();
    return jobs
      .map((job) => {
        const title = job.title?.trim();
        const applyUrl = job.url?.trim();
        const descriptionText = job.description?.trim() || title;
        if (!title || !applyUrl || !descriptionText) {
          return null;
        }
        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `${board}-export:${source.id}`,
          externalId: job.id?.trim() || applyUrl,
          title,
          descriptionText,
          applyUrl,
          location: job.location,
          isRemote: job.remote ?? /remote|remoto/i.test(`${job.location ?? ''} ${descriptionText}`),
          companyName: job.company || source.companyName || undefined,
          country: source.country ?? undefined,
          postedAt: job.postedAt ? new Date(job.postedAt) : undefined,
        });
        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}
