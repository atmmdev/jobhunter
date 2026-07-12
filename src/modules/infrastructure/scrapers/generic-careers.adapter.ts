import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractCareersJobLinks } from '@/modules/infrastructure/scrapers/extract-careers-job-links';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

/**
 * Best-effort HTML careers page adapter for CUSTOM ATS sources.
 */
export class GenericCareersAdapter implements JobSourceAdapter {
  readonly key = 'generic-careers';
  readonly atsTypes = ['CUSTOM'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'CUSTOM';
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const response = await fetch(source.baseUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'JobHunterBot/1.0 (+https://localhost)',
      },
      signal: AbortSignal.timeout(30_000),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Careers page HTTP ${response.status} for ${source.baseUrl}`);
    }

    const html = await response.text();
    const hostname = new URL(source.baseUrl).hostname;
    const links = extractCareersJobLinks(html, source.baseUrl);

    return links
      .map((link) => {
        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `careers:${hostname}`,
          externalId: link.externalId,
          title: link.title,
          descriptionText: `${link.title}. Imported from ${source.name} careers page.`,
          applyUrl: link.applyUrl,
          country: source.country ?? undefined,
          companyName: source.companyName ?? undefined,
        });
        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}
