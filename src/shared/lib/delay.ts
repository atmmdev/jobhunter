/**
 * Simple async delay helper for scrape pacing.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reads scrape delay between sources from env (`SCRAPE_DELAY_MS`, default 750).
 */
export function getScrapeDelayMs(): number {
  const raw = Number(process.env.SCRAPE_DELAY_MS ?? 750);
  if (Number.isNaN(raw) || raw < 0) {
    return 750;
  }
  return Math.min(60_000, Math.round(raw));
}
