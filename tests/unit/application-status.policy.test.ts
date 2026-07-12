import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  assertApplicationTransition,
  listAllowedApplicationTransitions,
} from '../../src/modules/domain/application/application-status.policy';
import { DomainError } from '../../src/modules/domain/shared/errors';

describe('application status policy', () => {
  it('allows pending approval to approved', () => {
    assert.doesNotThrow(() => assertApplicationTransition('PENDING_APPROVAL', 'APPROVED'));
  });

  it('rejects invalid transitions', () => {
    assert.throws(
      () => assertApplicationTransition('REJECTED', 'APPROVED'),
      (error: unknown) => error instanceof DomainError && error.code === 'INVALID_TRANSITION',
    );
  });

  it('lists allowed transitions for applied', () => {
    const next = listAllowedApplicationTransitions('APPLIED');
    assert.deepEqual(next.sort(), ['INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'].sort());
  });
});
