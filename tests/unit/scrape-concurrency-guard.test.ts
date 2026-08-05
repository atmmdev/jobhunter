import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DomainError } from '../../src/modules/domain/shared/errors';
import { ScrapeConcurrencyGuard } from '../../src/modules/infrastructure/scrape/scrape-concurrency-guard';

describe('ScrapeConcurrencyGuard', () => {
  it('allows sequential runs for the same source', async () => {
    const guard = new ScrapeConcurrencyGuard();
    const first = await guard.runExclusive('src-1', async () => 'a');
    const second = await guard.runExclusive('src-1', async () => 'b');
    assert.equal(first, 'a');
    assert.equal(second, 'b');
  });

  it('rejects overlapping runs for the same source', async () => {
    const guard = new ScrapeConcurrencyGuard();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const running = guard.runExclusive('src-1', async () => {
      await gate;
      return 'done';
    });

    await assert.rejects(
      () => guard.runExclusive('src-1', async () => 'nope'),
      (error: unknown) => error instanceof DomainError && error.code === 'SCRAPE_IN_PROGRESS',
    );

    release();
    assert.equal(await running, 'done');
  });

  it('rejects overlapping batch runs', async () => {
    const guard = new ScrapeConcurrencyGuard();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const running = guard.runBatchExclusive(async () => {
      await gate;
      return 'batch';
    });

    await assert.rejects(
      () => guard.runBatchExclusive(async () => 'nope'),
      (error: unknown) =>
        error instanceof DomainError && error.code === 'SCRAPE_BATCH_IN_PROGRESS',
    );

    release();
    assert.equal(await running, 'batch');
  });
});
