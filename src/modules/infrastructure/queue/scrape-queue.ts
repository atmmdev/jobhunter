import { Queue, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

export const SCRAPE_QUEUE_NAME = 'jobhunter-scrape';

export type ScrapeJobName = 'scrape-source' | 'scrape-enabled';

export interface ScrapeSourceJobData {
  sourceId: string;
  requestedBy?: string;
}

/**
 * Returns true when REDIS_URL is configured for background scrape workers.
 */
export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

/**
 * Builds a shared ioredis connection for BullMQ.
 */
export function createRedisConnection(): IORedis {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    throw new Error('REDIS_URL is not configured');
  }
  return new IORedis(url, {
    maxRetriesPerRequest: null,
  });
}

/**
 * Creates (or reuses) the scrape queue when Redis is available.
 */
export function createScrapeQueue(): Queue<ScrapeSourceJobData | Record<string, never>> | null {
  if (!isRedisConfigured()) {
    return null;
  }
  const connection = createRedisConnection() as unknown as ConnectionOptions;
  return new Queue(SCRAPE_QUEUE_NAME, { connection });
}
