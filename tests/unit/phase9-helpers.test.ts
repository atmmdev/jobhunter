import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getScrapeDelayMs } from '../../src/shared/lib/delay';
import { createCorrelationId, Logger } from '../../src/shared/logging/logger';

describe('getScrapeDelayMs', () => {
  it('defaults to 750 when unset', () => {
    const previous = process.env.SCRAPE_DELAY_MS;
    delete process.env.SCRAPE_DELAY_MS;
    assert.equal(getScrapeDelayMs(), 750);
    if (previous === undefined) {
      delete process.env.SCRAPE_DELAY_MS;
    } else {
      process.env.SCRAPE_DELAY_MS = previous;
    }
  });

  it('reads SCRAPE_DELAY_MS', () => {
    const previous = process.env.SCRAPE_DELAY_MS;
    process.env.SCRAPE_DELAY_MS = '1200';
    assert.equal(getScrapeDelayMs(), 1200);
    if (previous === undefined) {
      delete process.env.SCRAPE_DELAY_MS;
    } else {
      process.env.SCRAPE_DELAY_MS = previous;
    }
  });
});

describe('logger helpers', () => {
  it('creates correlation ids with prefix', () => {
    assert.match(createCorrelationId('scrape'), /^scrape-/);
  });

  it('child logger merges fields without throwing', () => {
    const logger = new Logger({ service: 'test' }).child({ correlationId: 'abc' });
    assert.ok(logger);
  });
});
