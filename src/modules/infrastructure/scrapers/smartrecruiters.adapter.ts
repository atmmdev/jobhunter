import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractSmartRecruitersCompany } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface SmartRecruitersLocation {
  city?: string;
  region?: string;
  country?: string;
  remote?: boolean;
  hybrid?: boolean;
  fullLocation?: string;
}

interface SmartRecruitersListItem {
  id?: string;
  name?: string;
  releasedDate?: string;
  location?: SmartRecruitersLocation;
  typeOfEmployment?: { id?: string; label?: string };
  ref?: string;
}

interface SmartRecruitersListResponse {
  offset?: number;
  limit?: number;
  totalFound?: number;
  content?: SmartRecruitersListItem[];
}

interface SmartRecruitersDetailResponse {
  id?: string;
  name?: string;
  postingUrl?: string;
  applyUrl?: string;
  releasedDate?: string;
  location?: SmartRecruitersLocation;
  typeOfEmployment?: { id?: string; label?: string };
  jobAd?: {
    sections?: Record<string, { title?: string; text?: string }>;
  };
}

const PAGE_SIZE = 100;
const MAX_JOBS = 200;
const MAX_DETAIL_FETCHES = 30;

/**
 * Fetches public SmartRecruiters company postings.
 */
export class SmartRecruitersAdapter implements JobSourceAdapter {
  readonly key = 'smartrecruiters';
  readonly atsTypes = ['SMARTRECRUITERS'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return (
      source.atsType === 'SMARTRECRUITERS' ||
      Boolean(extractSmartRecruitersCompany(source.baseUrl))
    );
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const company = extractSmartRecruitersCompany(source.baseUrl);
    if (!company) {
      throw new Error(`Could not extract SmartRecruiters company from ${source.baseUrl}`);
    }

    const listings = await this.fetchListings(company);
    const results: NormalizedJobDto[] = [];

    for (const [index, posting] of listings.entries()) {
      const externalId = posting.id?.trim();
      const title = posting.name?.trim();
      if (!externalId || !title) {
        continue;
      }

      let descriptionHtml = '';
      let descriptionText = `${title}. Location: ${formatLocation(posting.location)}. Fonte: SmartRecruiters`;
      let applyUrl = `https://jobs.smartrecruiters.com/${encodeURIComponent(company)}/${externalId}`;
      let employmentType = posting.typeOfEmployment?.label;
      let location = formatLocation(posting.location);
      let isRemote = posting.location?.remote;
      let postedAt = parseDate(posting.releasedDate);

      if (index < MAX_DETAIL_FETCHES) {
        const detail = await this.fetchDetail(company, externalId).catch(() => null);
        if (detail) {
          const sectionsHtml = Object.values(detail.jobAd?.sections ?? {})
            .map((section) => section.text ?? '')
            .filter(Boolean)
            .join('\n');
          if (sectionsHtml) {
            descriptionHtml = sectionsHtml;
            descriptionText = stripHtml(sectionsHtml) || descriptionText;
          }
          if (detail.applyUrl || detail.postingUrl) {
            applyUrl = detail.applyUrl || detail.postingUrl || applyUrl;
          }
          employmentType = detail.typeOfEmployment?.label ?? employmentType;
          location = formatLocation(detail.location) || location;
          isRemote = detail.location?.remote ?? isRemote;
          postedAt = parseDate(detail.releasedDate) ?? postedAt;
        }
      }

      const parsed = normalizedJobSchema.safeParse({
        sourceKey: `smartrecruiters:${company}`,
        externalId,
        title,
        descriptionText,
        descriptionHtml: descriptionHtml || undefined,
        applyUrl,
        location: location || undefined,
        country: posting.location?.country?.toUpperCase() || source.country || undefined,
        isRemote: isRemote ?? (location ? /remote/i.test(location) : undefined),
        employmentType,
        companyName: source.companyName ?? undefined,
        postedAt,
      });

      if (parsed.success) {
        results.push(parsed.data);
      }
    }

    return results;
  }

  private async fetchListings(company: string): Promise<SmartRecruitersListItem[]> {
    const collected: SmartRecruitersListItem[] = [];
    let offset = 0;

    while (collected.length < MAX_JOBS) {
      const endpoint = new URL(
        `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company)}/postings`,
      );
      endpoint.searchParams.set('limit', String(PAGE_SIZE));
      endpoint.searchParams.set('offset', String(offset));

      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`SmartRecruiters API ${response.status} for company ${company}`);
      }

      const payload = (await response.json()) as SmartRecruitersListResponse;
      const batch = payload.content ?? [];
      if (batch.length === 0) {
        break;
      }

      collected.push(...batch);
      offset += batch.length;

      const total = payload.totalFound ?? collected.length;
      if (offset >= total || batch.length < PAGE_SIZE) {
        break;
      }
    }

    return collected.slice(0, MAX_JOBS);
  }

  private async fetchDetail(
    company: string,
    postingId: string,
  ): Promise<SmartRecruitersDetailResponse> {
    const endpoint = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company)}/postings/${encodeURIComponent(postingId)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`SmartRecruiters detail ${response.status}`);
    }
    return (await response.json()) as SmartRecruitersDetailResponse;
  }
}

function formatLocation(location: SmartRecruitersLocation | undefined): string {
  if (!location) {
    return '';
  }
  if (location.fullLocation?.trim()) {
    return location.fullLocation.trim();
  }
  return [location.city, location.region, location.country]
    .filter(Boolean)
    .join(', ');
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
