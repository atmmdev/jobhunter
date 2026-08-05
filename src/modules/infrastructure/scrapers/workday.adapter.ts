import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractWorkdayBoard } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface WorkdayJobPosting {
  title?: string;
  externalPath?: string;
  locationsText?: string;
  postedOn?: string;
  bulletFields?: string[];
}

interface WorkdayJobsResponse {
  total?: number;
  jobPostings?: WorkdayJobPosting[];
}

interface WorkdayJobDetailResponse {
  jobPostingInfo?: {
    id?: string;
    title?: string;
    jobDescription?: string;
    location?: string;
    timeType?: string;
    startDate?: string;
    canApply?: boolean;
  };
}

const PAGE_SIZE = 20;
const MAX_JOBS = 100;
const MAX_DETAIL_FETCHES = 25;

/**
 * Fetches public Workday career-site jobs via undocumented CXS JSON endpoints.
 */
export class WorkdayAdapter implements JobSourceAdapter {
  readonly key = 'workday';
  readonly atsTypes = ['WORKDAY'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'WORKDAY' || Boolean(extractWorkdayBoard(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const board = extractWorkdayBoard(source.baseUrl);
    if (!board) {
      throw new Error(`Could not extract Workday board from ${source.baseUrl}`);
    }

    const listings = await this.fetchListings(board);
    const results: NormalizedJobDto[] = [];

    for (const [index, posting] of listings.entries()) {
      const externalPath = posting.externalPath;
      const title = posting.title?.trim();
      if (!externalPath || !title) {
        continue;
      }

      const externalId =
        posting.bulletFields?.[0] ||
        externalPath.split('/').filter(Boolean).at(-1) ||
        externalPath;

      let descriptionHtml = '';
      let descriptionText = `${title}. Location: ${posting.locationsText ?? 'n/a'}. Fonte: Workday`;
      let employmentType: string | undefined;
      let postedAt: Date | undefined;

      if (index < MAX_DETAIL_FETCHES) {
        const detail = await this.fetchDetail(board, externalPath).catch(() => null);
        const info = detail?.jobPostingInfo;
        if (info?.jobDescription) {
          descriptionHtml = info.jobDescription;
          descriptionText = stripHtml(info.jobDescription) || descriptionText;
        }
        if (info?.timeType) {
          employmentType = info.timeType;
        }
        if (info?.startDate) {
          const parsedDate = new Date(info.startDate);
          if (!Number.isNaN(parsedDate.getTime())) {
            postedAt = parsedDate;
          }
        }
      }

      const applyUrl = `https://${board.host}/en-US/${board.site}${externalPath}`;
      const location = posting.locationsText?.trim();
      const parsed = normalizedJobSchema.safeParse({
        sourceKey: `workday:${board.tenant}:${board.site}`,
        externalId,
        title,
        descriptionText,
        descriptionHtml: descriptionHtml || undefined,
        applyUrl,
        location,
        country: source.country ?? undefined,
        isRemote: location ? /remote|hybrid/i.test(location) : undefined,
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

  private async fetchListings(board: {
    host: string;
    tenant: string;
    site: string;
  }): Promise<WorkdayJobPosting[]> {
    const collected: WorkdayJobPosting[] = [];
    let offset = 0;

    while (collected.length < MAX_JOBS) {
      const endpoint = `https://${board.host}/wday/cxs/${encodeURIComponent(board.tenant)}/${encodeURIComponent(board.site)}/jobs`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appliedFacets: {},
          limit: PAGE_SIZE,
          offset,
          searchText: '',
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`Workday API ${response.status} for ${board.tenant}/${board.site}`);
      }

      const payload = (await response.json()) as WorkdayJobsResponse;
      const batch = payload.jobPostings ?? [];
      if (batch.length === 0) {
        break;
      }

      collected.push(...batch);
      offset += batch.length;
      if (collected.length >= (payload.total ?? MAX_JOBS) || batch.length < PAGE_SIZE) {
        break;
      }
    }

    return collected.slice(0, MAX_JOBS);
  }

  private async fetchDetail(
    board: { host: string; tenant: string; site: string },
    externalPath: string,
  ): Promise<WorkdayJobDetailResponse> {
    const endpoint = `https://${board.host}/wday/cxs/${encodeURIComponent(board.tenant)}/${encodeURIComponent(board.site)}${externalPath}`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      throw new Error(`Workday detail ${response.status}`);
    }
    return (await response.json()) as WorkdayJobDetailResponse;
  }
}
