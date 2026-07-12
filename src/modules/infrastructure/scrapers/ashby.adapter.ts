import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractAshbyBoard } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface AshbyJobApi {
  id?: string;
  title?: string;
  jobUrl?: string;
  applyUrl?: string;
  location?: string;
  isRemote?: boolean;
  employmentType?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  publishedAt?: string;
  department?: string;
  team?: string;
}

interface AshbyBoardResponse {
  jobs?: AshbyJobApi[];
}

/**
 * Fetches public Ashby job board postings.
 */
export class AshbyAdapter implements JobSourceAdapter {
  readonly key = 'ashby';
  readonly atsTypes = ['ASHBY'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'ASHBY' || Boolean(extractAshbyBoard(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const board = extractAshbyBoard(source.baseUrl);
    if (!board) {
      throw new Error(`Could not extract Ashby board from ${source.baseUrl}`);
    }

    const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Ashby API ${response.status} for board ${board}`);
    }

    const payload = (await response.json()) as AshbyBoardResponse;
    const jobs = payload.jobs ?? [];

    return jobs
      .map((job) => {
        const descriptionHtml = job.descriptionHtml ?? '';
        const descriptionText =
          job.descriptionPlain?.trim() ||
          stripHtml(descriptionHtml) ||
          job.title ||
          'No description';
        const applyUrl = job.applyUrl || job.jobUrl;
        const location = job.location?.trim();

        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `ashby:${board}`,
          externalId: job.id,
          title: job.title ?? 'Untitled',
          descriptionText,
          descriptionHtml: descriptionHtml || undefined,
          applyUrl,
          location,
          country: source.country ?? undefined,
          isRemote: job.isRemote ?? (location ? /remote/i.test(location) : undefined),
          employmentType: job.employmentType,
          companyName: source.companyName ?? undefined,
          postedAt: job.publishedAt ? new Date(job.publishedAt) : undefined,
        });

        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}
