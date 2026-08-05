import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { extractPersonioBoard } from '@/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

/**
 * Fetches public Personio career jobs from the XML board feed.
 */
export class PersonioAdapter implements JobSourceAdapter {
  readonly key = 'personio';
  readonly atsTypes = ['PERSONIO'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.atsType === 'PERSONIO' || Boolean(extractPersonioBoard(source.baseUrl));
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const board = extractPersonioBoard(source.baseUrl);
    if (!board) {
      throw new Error(`Could not extract Personio board from ${source.baseUrl}`);
    }

    const endpoint = `https://${board.host}/xml`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/xml,text/xml' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw new Error(`Personio XML ${response.status} for ${board.company}`);
    }

    const xml = await response.text();
    const positions = extractPositions(xml);

    return positions
      .map((position) => {
        const title = position.name?.trim();
        const externalId = position.id?.trim();
        if (!title || !externalId) {
          return null;
        }

        const descriptionHtml = position.descriptions.join('\n');
        const descriptionText =
          stripHtml(descriptionHtml) || `${title}. Location: ${position.office ?? 'n/a'}. Fonte: Personio`;
        const applyUrl = `https://${board.host}/job/${externalId}`;
        const location = position.office?.trim();
        const isRemote = location ? /remote|home.?office|homeoffice/i.test(location) : undefined;

        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `personio:${board.company}`,
          externalId,
          title,
          descriptionText,
          descriptionHtml: descriptionHtml || undefined,
          applyUrl,
          location: location || undefined,
          country: source.country ?? undefined,
          isRemote,
          employmentType: position.employmentType || undefined,
          seniority: position.seniority || undefined,
          companyName: source.companyName ?? undefined,
          postedAt: parseDate(position.createdAt),
        });

        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }
}

interface PersonioPosition {
  id?: string;
  name?: string;
  office?: string;
  employmentType?: string;
  seniority?: string;
  createdAt?: string;
  descriptions: string[];
}

function extractPositions(xml: string): PersonioPosition[] {
  const blocks = xml.match(/<position>[\s\S]*?<\/position>/gi) ?? [];
  return blocks.map((block) => {
    const descriptions: string[] = [];
    const descBlocks = block.match(/<jobDescription>[\s\S]*?<\/jobDescription>/gi) ?? [];
    for (const desc of descBlocks) {
      const value = extractTag(desc, 'value');
      if (value) {
        descriptions.push(decodeXml(value));
      }
    }

    return {
      id: extractTag(block, 'id') ?? undefined,
      name: extractTag(block, 'name') ?? undefined,
      office: extractTag(block, 'office') ?? undefined,
      employmentType: extractTag(block, 'employmentType') ?? undefined,
      seniority: extractTag(block, 'seniority') ?? undefined,
      createdAt: extractTag(block, 'createdAt') ?? undefined,
      descriptions,
    };
  });
}

function extractTag(xml: string, tag: string): string | null {
  const cdata = xml.match(new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i'));
  if (cdata?.[1] != null) {
    return cdata[1].trim();
  }
  const plain = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return plain?.[1]?.trim() ?? null;
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
