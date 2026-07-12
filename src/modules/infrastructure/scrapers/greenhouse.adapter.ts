import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractGreenhouseBoardToken } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface GreenhouseJobApi {
  id: number | string;
  title?: string;
  absolute_url?: string;
  updated_at?: string;
  content?: string;
  location?: { name?: string };
}

interface GreenhouseJobsResponse {
  jobs?: GreenhouseJobApi[];
}

/**
 * Fetches public Greenhouse board jobs via boards-api.
 */
export class GreenhouseAdapter implements JobSourceAdapter {
  readonly key = 'greenhouse';
  readonly atsTypes = ['GREENHOUSE'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'GREENHOUSE' || Boolean(extractGreenhouseBoardToken(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const token = extractGreenhouseBoardToken(source.baseUrl);
    if (!token) {
      throw new Error(`Could not extract Greenhouse board token from ${source.baseUrl}`);
    }

    const endpoint = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Greenhouse API ${response.status} for board ${token}`);
    }

    const payload = (await response.json()) as GreenhouseJobsResponse;
    const jobs = payload.jobs ?? [];

    return jobs
      .map((job) => {
        const descriptionHtml = job.content ?? '';
        const descriptionText = stripHtml(descriptionHtml) || job.title || 'No description';
        const location = job.location?.name?.trim();

        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `greenhouse:${token}`,
          externalId: String(job.id),
          title: job.title ?? 'Untitled',
          descriptionText,
          descriptionHtml: descriptionHtml || undefined,
          applyUrl: job.absolute_url,
          location,
          country: source.country ?? undefined,
          isRemote: location ? /remote/i.test(location) : undefined,
          companyName: source.companyName ?? undefined,
          postedAt: job.updated_at ? new Date(job.updated_at) : undefined,
        });

        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}
