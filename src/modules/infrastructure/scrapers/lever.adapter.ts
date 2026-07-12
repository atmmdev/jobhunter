import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractLeverSite } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface LeverPostingApi {
  id?: string;
  text?: string;
  hostedUrl?: string;
  applyUrl?: string;
  description?: string;
  descriptionPlain?: string;
  createdAt?: number;
  categories?: {
    location?: string;
    commitment?: string;
    team?: string;
    level?: string;
  };
}

/**
 * Fetches public Lever postings via api.lever.co.
 */
export class LeverAdapter implements JobSourceAdapter {
  readonly key = 'lever';
  readonly atsTypes = ['LEVER'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'LEVER' || Boolean(extractLeverSite(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const site = extractLeverSite(source.baseUrl);
    if (!site) {
      throw new Error(`Could not extract Lever site from ${source.baseUrl}`);
    }

    const endpoint = `https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Lever API ${response.status} for site ${site}`);
    }

    const payload = (await response.json()) as LeverPostingApi[];
    const postings = Array.isArray(payload) ? payload : [];

    return postings
      .map((job) => {
        const descriptionHtml = job.description ?? '';
        const descriptionText =
          job.descriptionPlain?.trim() ||
          stripHtml(descriptionHtml) ||
          job.text ||
          'No description';
        const location = job.categories?.location?.trim();
        const applyUrl = job.applyUrl || job.hostedUrl;

        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `lever:${site}`,
          externalId: job.id,
          title: job.text ?? 'Untitled',
          descriptionText,
          descriptionHtml: descriptionHtml || undefined,
          applyUrl,
          location,
          country: source.country ?? undefined,
          isRemote: location ? /remote/i.test(location) : undefined,
          employmentType: job.categories?.commitment,
          seniority: job.categories?.level,
          companyName: source.companyName ?? undefined,
          postedAt: job.createdAt ? new Date(job.createdAt) : undefined,
        });

        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}
