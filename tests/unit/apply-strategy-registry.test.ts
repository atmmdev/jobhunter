import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApplyStrategyRegistry } from '../../src/modules/infrastructure/apply/apply-strategy-registry';

describe('ApplyStrategyRegistry', () => {
  const registry = new ApplyStrategyRegistry();

  it('resolves Greenhouse URLs', () => {
    const strategy = registry.resolve({
      applicationId: 'a',
      jobId: 'j',
      applyUrl: 'https://boards.greenhouse.io/acme/jobs/123',
      jobTitle: 'Engineer',
      companyName: 'Acme',
      atsHint: 'GREENHOUSE',
    });
    assert.equal(strategy?.key, 'greenhouse');
  });

  it('resolves Lever URLs', () => {
    const strategy = registry.resolve({
      applicationId: 'a',
      jobId: 'j',
      applyUrl: 'https://jobs.lever.co/acme/abc',
      jobTitle: 'Engineer',
      companyName: 'Acme',
      atsHint: null,
    });
    assert.equal(strategy?.key, 'lever');
  });

  it('falls back to careers strategy', () => {
    const strategy = registry.resolve({
      applicationId: 'a',
      jobId: 'j',
      applyUrl: 'https://careers.example.com/jobs/1',
      jobTitle: 'Engineer',
      companyName: 'Example',
      atsHint: 'CUSTOM',
    });
    assert.equal(strategy?.key, 'careers');
  });
});
