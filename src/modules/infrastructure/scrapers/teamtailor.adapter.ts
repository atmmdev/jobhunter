import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractTeamTailorOrigin } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface TeamTailorJobLocation {
  address?: {
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
  };
}

interface TeamTailorJobPosting {
  title?: string;
  description?: string;
  datePosted?: string;
  identifier?: { value?: string } | string;
  hiringOrganization?: { name?: string };
  jobLocation?: TeamTailorJobLocation | TeamTailorJobLocation[];
  jobLocationType?: string;
  employmentType?: string | string[];
}

interface TeamTailorFeedItem {
  id?: string;
  title?: string;
  url?: string;
  date_published?: string;
  content_html?: string;
  _jobposting?: TeamTailorJobPosting;
}

interface TeamTailorFeedResponse {
  items?: TeamTailorFeedItem[];
}

/**
 * Fetches public TeamTailor career-site jobs via the JSON Feed at `/jobs.json`.
 */
export class TeamTailorAdapter implements JobSourceAdapter {
  readonly key = 'teamtailor';
  readonly atsTypes = ['TEAMTAILOR'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'TEAMTAILOR' || Boolean(extractTeamTailorOrigin(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const origin = extractTeamTailorOrigin(source.baseUrl);
    if (!origin) {
      throw new Error(`Could not extract TeamTailor origin from ${source.baseUrl}`);
    }

    const endpoint = `${origin}/jobs.json`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`TeamTailor feed ${response.status} for ${origin}`);
    }

    const payload = (await response.json()) as TeamTailorFeedResponse;
    const host = new URL(origin).hostname;

    return (payload.items ?? [])
      .map((item) => {
        const posting = item._jobposting;
        const title = item.title?.trim() || posting?.title?.trim();
        const applyUrl = item.url?.trim();
        if (!title || !applyUrl) {
          return null;
        }

        const externalId =
          item.id?.trim() ||
          (typeof posting?.identifier === 'string'
            ? posting.identifier
            : posting?.identifier?.value) ||
          applyUrl;

        const descriptionHtml = posting?.description || item.content_html || '';
        const descriptionText =
          stripHtml(descriptionHtml) || `${title}. Fonte: TeamTailor`;
        const location = formatTeamTailorLocation(posting?.jobLocation);
        const employmentType = Array.isArray(posting?.employmentType)
          ? posting.employmentType.join(', ')
          : posting?.employmentType;
        const isRemote =
          posting?.jobLocationType === 'TELECOMMUTE' ||
          (location ? /remote/i.test(location) : undefined);
        const postedAt = parseDate(item.date_published || posting?.datePosted);

        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `teamtailor:${host}`,
          externalId,
          title,
          descriptionText,
          descriptionHtml: descriptionHtml || undefined,
          applyUrl,
          location: location || undefined,
          country:
            firstLocation(posting?.jobLocation)?.address?.addressCountry ||
            source.country ||
            undefined,
          isRemote,
          employmentType,
          companyName:
            posting?.hiringOrganization?.name || source.companyName || undefined,
          postedAt,
        });

        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}

function firstLocation(
  location: TeamTailorJobLocation | TeamTailorJobLocation[] | undefined,
): TeamTailorJobLocation | undefined {
  if (!location) {
    return undefined;
  }
  return Array.isArray(location) ? location[0] : location;
}

function formatTeamTailorLocation(
  location: TeamTailorJobLocation | TeamTailorJobLocation[] | undefined,
): string {
  const first = firstLocation(location);
  if (!first?.address) {
    return '';
  }
  return [
    first.address.addressLocality,
    first.address.addressRegion,
    first.address.addressCountry,
  ]
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
