import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractGupySubdomain } from '@/modules/infrastructure/scrapers/extract-board-token';
import { extractGupyJobsFromHtml } from '@/modules/infrastructure/scrapers/extract-gupy-jobs';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

/**
 * Scrapes Gupy career pages via public SSR `__NEXT_DATA__` payloads.
 */
export class GupyAdapter implements JobSourceAdapter {
  readonly key = 'gupy';
  readonly atsTypes = ['GUPY'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'GUPY' || Boolean(extractGupySubdomain(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const subdomain = extractGupySubdomain(source.baseUrl);
    if (!subdomain) {
      throw new Error(`Could not extract Gupy subdomain from ${source.baseUrl}`);
    }

    const endpoint = `https://${subdomain}.gupy.io/`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'JobHunterBot/1.0 (+https://localhost)',
      },
      signal: AbortSignal.timeout(45_000),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Gupy HTTP ${response.status} for ${endpoint}`);
    }

    const html = await response.text();
    const jobs = extractGupyJobsFromHtml(html, subdomain);

    return jobs
      .map((job) => {
        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `gupy:${subdomain}`,
          externalId: job.externalId,
          title: job.title,
          descriptionText: job.descriptionText,
          descriptionHtml: job.descriptionHtml ?? undefined,
          applyUrl: job.applyUrl,
          location: job.location ?? undefined,
          country: job.country ?? source.country ?? 'BR',
          isRemote: job.isRemote ?? undefined,
          employmentType: job.employmentType ?? undefined,
          companyName: job.companyName ?? source.companyName ?? undefined,
          postedAt: job.postedAt ?? undefined,
        });
        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}
