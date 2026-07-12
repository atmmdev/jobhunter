import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractApinfoJobs } from '@/modules/infrastructure/scrapers/extract-apinfo-jobs';
import { readResponseText } from '@/modules/infrastructure/scrapers/read-response-text';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

const APINFO_LISTING_URLS = [
  'https://www.apinfo.com/apinfo/index.cfm',
  'https://www.apinfo.com/apinfo/',
] as const;

/**
 * Scrapes Apinfo recent job cards (BR tech board). Search endpoints are rate-limited.
 */
export class ApinfoAdapter implements JobSourceAdapter {
  readonly key = 'apinfo';
  readonly atsTypes = ['APINFO'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'APINFO' || /apinfo\.com/i.test(source.baseUrl);
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    let html = '';
    let lastError: Error | null = null;

    for (const url of APINFO_LISTING_URLS) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'text/html,application/xhtml+xml',
            'User-Agent': 'JobHunterBot/1.0 (+https://localhost)',
          },
          signal: AbortSignal.timeout(30_000),
          redirect: 'follow',
        });

        if (!response.ok) {
          lastError = new Error(`Apinfo HTTP ${response.status} for ${url}`);
          continue;
        }

        html = await readResponseText(response, 'windows-1252');
        if (html.includes('bloco-vaga-unica') || html.includes('codvaga=')) {
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Apinfo fetch failed');
      }
    }

    if (!html) {
      throw lastError ?? new Error(`Could not fetch Apinfo listings from ${source.baseUrl}`);
    }

    const jobs = extractApinfoJobs(html);

    return jobs
      .map((job) => {
        const parsed = normalizedJobSchema.safeParse({
          sourceKey: 'apinfo',
          externalId: job.externalId,
          title: job.title,
          descriptionText: job.descriptionText,
          applyUrl: job.applyUrl,
          location: job.location ?? undefined,
          country: source.country ?? 'BR',
          isRemote: job.isRemote ?? undefined,
          companyName: job.companyName ?? source.companyName ?? undefined,
        });
        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}
