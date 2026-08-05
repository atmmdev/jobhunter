import { Worker, type ConnectionOptions } from 'bullmq';

import { createScrapeModule } from '@/modules/infrastructure/composition';
import {
  createRedisConnection,
  SCRAPE_QUEUE_NAME,
  type ScrapeSourceJobData,
} from '@/modules/infrastructure/queue/scrape-queue';
import { rootLogger } from '@/shared/logging/logger';

/**
 * Starts the BullMQ scrape worker (long-running process).
 */
async function main() {
  if (!process.env.REDIS_URL?.trim()) {
    throw new Error('REDIS_URL is required for the scrape worker');
  }

  const log = rootLogger.child({ service: 'scrape-worker' });
  const connection = createRedisConnection() as unknown as ConnectionOptions;
  const { runSource, runEnabledSources } = createScrapeModule();

  const worker = new Worker(
    SCRAPE_QUEUE_NAME,
    async (job) => {
      const jobLog = log.child({ bullJobId: job.id, name: job.name });
      jobLog.info('worker.job.started');

      if (job.name === 'scrape-source') {
        const data = job.data as ScrapeSourceJobData;
        const result = await runSource.execute({ sourceId: data.sourceId });
        jobLog.info('worker.job.finished', {
          status: result.status,
          jobsFound: result.jobsFound,
        });
        return result;
      }

      if (job.name === 'scrape-enabled') {
        const results = await runEnabledSources.execute();
        jobLog.info('worker.job.finished', {
          ran: results.length,
          ok: results.filter((item) => item.ok).length,
        });
        return results;
      }

      throw new Error(`Unknown scrape job name: ${job.name}`);
    },
    {
      connection,
      concurrency: Number(process.env.SCRAPE_WORKER_CONCURRENCY ?? 1),
    },
  );

  worker.on('failed', (job, error) => {
    log.error('worker.job.failed', {
      bullJobId: job?.id,
      error: error.message,
    });
  });

  log.info('worker.started', { queue: SCRAPE_QUEUE_NAME });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
