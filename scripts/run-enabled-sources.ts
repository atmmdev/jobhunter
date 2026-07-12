import { createScrapeModule } from '@/modules/infrastructure/composition';

/**
 * CLI entrypoint to scrape all enabled sources with a registered adapter.
 */
async function main() {
  const { runEnabledSources } = createScrapeModule();
  const results = await runEnabledSources.execute();

  if (results.length === 0) {
    console.log('No enabled sources with a supported adapter.');
    return;
  }

  for (const result of results) {
    if (result.ok) {
      console.log(
        `[OK] ${result.sourceName}: ${result.adapterKey} found=${result.jobsFound} created=${result.jobsCreated} updated=${result.jobsUpdated}`,
      );
      continue;
    }

    console.error(`[FAIL] ${result.sourceName}: ${result.error}`);
  }

  const failed = results.filter((result) => !result.ok).length;
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
