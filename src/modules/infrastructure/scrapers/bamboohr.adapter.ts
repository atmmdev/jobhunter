import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractBambooHrSubdomain } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface BambooHrLocation {
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  addressCountry?: string | null;
}

interface BambooHrListItem {
  id?: string;
  jobOpeningName?: string;
  departmentLabel?: string;
  employmentStatusLabel?: string;
  employmentType?: string | null;
  location?: BambooHrLocation | null;
  atsLocation?: BambooHrLocation | null;
  isRemote?: boolean | null;
  locationType?: string | null;
}

interface BambooHrListResponse {
  result?: BambooHrListItem[];
}

interface BambooHrDetailResponse {
  result?: {
    jobOpening?: {
      jobOpeningShareUrl?: string;
      jobOpeningName?: string;
      description?: string;
      employmentStatusLabel?: string;
      employmentType?: string | null;
      location?: BambooHrLocation | null;
      datePosted?: string;
      isRemote?: boolean | null;
      locationType?: string | null;
    };
  };
}

const MAX_DETAIL_FETCHES = 40;

/**
 * Fetches public BambooHR career openings via undocumented careers JSON endpoints.
 */
export class BambooHrAdapter implements JobSourceAdapter {
  readonly key = 'bamboohr';
  readonly atsTypes = ['BAMBOOHR'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'BAMBOOHR' || Boolean(extractBambooHrSubdomain(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const subdomain = extractBambooHrSubdomain(source.baseUrl);
    if (!subdomain) {
      throw new Error(`Could not extract BambooHR subdomain from ${source.baseUrl}`);
    }

    const listings = await this.fetchListings(subdomain);
    const results: NormalizedJobDto[] = [];

    for (const [index, posting] of listings.entries()) {
      const externalId = posting.id?.trim();
      const title = posting.jobOpeningName?.trim();
      if (!externalId || !title) {
        continue;
      }

      const listLocation = formatBambooLocation(posting.location ?? posting.atsLocation);
      let descriptionHtml = '';
      let descriptionText = `${title}. Location: ${listLocation || 'n/a'}. Fonte: BambooHR`;
      let applyUrl = `https://${subdomain}.bamboohr.com/careers/${externalId}`;
      let employmentType =
        posting.employmentType?.trim() || posting.employmentStatusLabel?.trim() || undefined;
      let location = listLocation;
      let isRemote = posting.isRemote ?? undefined;
      let postedAt: Date | undefined;
      let country =
        posting.location?.addressCountry ||
        posting.atsLocation?.addressCountry ||
        source.country ||
        undefined;

      if (index < MAX_DETAIL_FETCHES) {
        const detail = await this.fetchDetail(subdomain, externalId).catch(() => null);
        const opening = detail?.result?.jobOpening;
        if (opening) {
          if (opening.description) {
            descriptionHtml = opening.description;
            descriptionText = stripHtml(opening.description) || descriptionText;
          }
          if (opening.jobOpeningShareUrl) {
            applyUrl = opening.jobOpeningShareUrl;
          }
          employmentType =
            opening.employmentType?.trim() ||
            opening.employmentStatusLabel?.trim() ||
            employmentType;
          location = formatBambooLocation(opening.location) || location;
          isRemote = opening.isRemote ?? isRemote;
          country = opening.location?.addressCountry || country;
          postedAt = parseDate(opening.datePosted);
        }
      }

      if (isRemote === undefined && location) {
        isRemote = /remote/i.test(location);
      }

      const parsed = normalizedJobSchema.safeParse({
        sourceKey: `bamboohr:${subdomain}`,
        externalId,
        title,
        descriptionText,
        descriptionHtml: descriptionHtml || undefined,
        applyUrl,
        location: location || undefined,
        country: country || undefined,
        isRemote,
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

  private async fetchListings(subdomain: string): Promise<BambooHrListItem[]> {
    const endpoint = `https://${subdomain}.bamboohr.com/careers/list`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`BambooHR list ${response.status} for ${subdomain}`);
    }

    const payload = (await response.json()) as BambooHrListResponse;
    return payload.result ?? [];
  }

  private async fetchDetail(
    subdomain: string,
    jobId: string,
  ): Promise<BambooHrDetailResponse> {
    const endpoint = `https://${subdomain}.bamboohr.com/careers/${encodeURIComponent(jobId)}/detail`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`BambooHR detail ${response.status}`);
    }
    return (await response.json()) as BambooHrDetailResponse;
  }
}

function formatBambooLocation(location: BambooHrLocation | null | undefined): string {
  if (!location) {
    return '';
  }
  return [location.city, location.state, location.addressCountry].filter(Boolean).join(', ');
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
