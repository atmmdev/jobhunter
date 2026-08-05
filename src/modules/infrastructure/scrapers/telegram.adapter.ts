import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { normalizedJobSchema, type NormalizedJobDto } from '@/shared/schemas/scrape.schema';

interface TelegramMessageLike {
  message_id?: number;
  text?: string;
  date?: number;
  entities?: Array<{ type?: string; url?: string }>;
  chat?: { id?: number | string };
}

/**
 * Ingests Telegram job messages from config.messages or Bot API getUpdates.
 */
export class TelegramAdapter implements JobSourceAdapter {
  readonly key = 'telegram';
  readonly atsTypes = ['CUSTOM'] as const;

  supports(source: ScrapeSourceInput): boolean {
    return source.type === 'TELEGRAM' || /t\.me|telegram/i.test(source.baseUrl);
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
          message.entities?.find((entity) => entity.type === 'url' && entity.url)?.url ||
          extractFirstUrl(text) ||
          source.baseUrl;
        const title =
          text.split('\n').find((line) => line.trim().length > 0)?.slice(0, 140) ||
          'Telegram job';
        const externalId = String(message.message_id ?? hashText(text));
        const postedAt =
          typeof message.date === 'number' ? new Date(message.date * 1000) : undefined;

        const parsed = normalizedJobSchema.safeParse({
          sourceKey: `telegram:${source.id}`,
          externalId,
          title,
          descriptionText: text,
          applyUrl,
          companyName: source.companyName ?? undefined,
          country: source.country ?? undefined,
          isRemote: /remote|remoto/i.test(text),
          postedAt,
        });
        return parsed.success ? parsed.data : null;
      })
      .filter((job): job is NormalizedJobDto => job !== null);
  }

  private async loadMessages(source: ScrapeSourceInput): Promise<TelegramMessageLike[]> {
    const config = source.config;
    if (config && typeof config === 'object' && config !== null) {
      const messages = (config as { messages?: TelegramMessageLike[] }).messages;
      if (Array.isArray(messages) && messages.length > 0) {
        return messages;
      }
    }

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId =
      config && typeof config === 'object' && config !== null
        ? (config as { chatId?: string | number }).chatId
        : undefined;

    if (!token || chatId == null) {
      throw new Error(
        'Telegram source needs config.messages[] or TELEGRAM_BOT_TOKEN + config.chatId',
      );
    }

    const endpoint = new URL(`https://api.telegram.org/bot${token}/getUpdates`);
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
      throw new Error(`Telegram API ${response.status}`);
    }
    const payload = (await response.json()) as {
      result?: Array<{ message?: TelegramMessageLike }>;
    };
    return (payload.result ?? [])
      .map((update) => update.message)
      .filter((message): message is TelegramMessageLike => Boolean(message?.text))
      .filter((message) => String(message.chat?.id) === String(chatId));
  }
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/\S+/i);
  return match?.[0]?.replace(/[),.]+$/, '') ?? null;
}

function hashText(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return `tg-${Math.abs(hash)}`;
}
