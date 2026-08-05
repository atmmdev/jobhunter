import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface SlackMessageLike {
  ts?: string;
  text?: string;
  permalink?: string;
}

/**
 * Ingests Slack channel job posts from:
 * - source.config.messages (JSON array), or
 * - conversations.history when SLACK_BOT_TOKEN + config.channelId are set.
 */
export class SlackAdapter implements JobSourceAdapter {
  readonly key = 'slack';
  readonly atsTypes = ['CUSTOM'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.type === 'SLACK' || /slack\.com/i.test(source.baseUrl);
  }

  async fetchJobs(source: ScrapeSourceInput): Promise<NormalizedJobDto[]> {
    const messages = await this.loadMessages(source);
    return messages
      .map((message) => {
        const text = message.text?.trim();
        if (!text || text.length < 20) {
          return null;
        }
        const applyUrl =
          extractFirstUrl(text) || message.permalink || source.baseUrl;
        const title =
          text.split('\n').find((line) => line.trim().length > 0)?.slice(0, 140) ||
          'Slack job';
        const externalId = message.ts || hashText(text);

        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `slack:${source.id}`,
          externalId,
          title,
          descriptionText: text,
          applyUrl,
          companyName: source.companyName ?? undefined,
          country: source.country ?? undefined,
          isRemote: /remote|remoto/i.test(text),
        });
        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }

  private async loadMessages(source: ScrapeSourceInput): Promise<SlackMessageLike[]> {
    const config = source.config;
    if (config && typeof config === 'object' && config !== null) {
      const messages = (config as { messages?: SlackMessageLike[] }).messages;
      if (Array.isArray(messages) && messages.length > 0) {
        return messages;
      }
    }

    const token = process.env.SLACK_BOT_TOKEN?.trim();
    const channelId =
      config && typeof config === 'object' && config !== null
        ? (config as { channelId?: string }).channelId
        : undefined;

    if (!token || !channelId) {
      throw new Error(
        'Slack source needs config.messages[] or SLACK_BOT_TOKEN + config.channelId',
      );
    }

    const endpoint = new URL('https://slack.com/api/conversations.history');
    endpoint.searchParams.set('channel', channelId);
    endpoint.searchParams.set('limit', '100');
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`Slack API HTTP ${response.status}`);
    }
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      messages?: SlackMessageLike[];
    };
    if (!payload.ok) {
      throw new Error(`Slack API error: ${payload.error ?? 'unknown'}`);
    }
    return payload.messages ?? [];
  }
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/\S+/i);
  return match?.[0]?.replace(/[),.>|]+$/, '') ?? null;
}

function hashText(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return `slack-${Math.abs(hash)}`;
}
