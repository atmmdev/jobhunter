import type {
  ApplicationStatusValue,
  ManualApplicationTransition,
} from '@/modules/domain/application/application.entity';
import { DomainError } from '@/modules/domain/shared/errors';

const ALLOWED: Record<ApplicationStatusValue, readonly ApplicationStatusValue[]> = {
  DRAFT: ['PENDING_APPROVAL', 'WITHDRAWN'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
  APPROVED: ['PENDING_APPLY', 'APPLIED', 'MANUAL_REQUIRED', 'WITHDRAWN'],
  PENDING_APPLY: ['APPLIED', 'FAILED', 'MANUAL_REQUIRED', 'WITHDRAWN'],
  APPLIED: ['INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'],
  FAILED: ['PENDING_APPLY', 'MANUAL_REQUIRED', 'WITHDRAWN'],
  MANUAL_REQUIRED: ['APPLIED', 'PENDING_APPLY', 'WITHDRAWN'],
  INTERVIEW: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['WITHDRAWN'],
  REJECTED: [],
  WITHDRAWN: [],
};

/**
 * Asserts that a status transition is allowed by the application state machine.
 */
export function assertApplicationTransition(
  from: ApplicationStatusValue,
  to: ManualApplicationTransition,
): void {
  if (!ALLOWED[from].includes(to)) {
    throw new DomainError(
      'INVALID_TRANSITION',
      `Cannot transition application from ${from} to ${to}`,
    );
  }
}

/**
 * Returns UI-allowed next statuses from the current status.
 */
export function listAllowedApplicationTransitions(
  from: ApplicationStatusValue,
): ManualApplicationTransition[] {
  return ALLOWED[from].filter((status): status is ManualApplicationTransition =>
    (
      [
        'APPROVED',
        'PENDING_APPLY',
        'APPLIED',
        'MANUAL_REQUIRED',
        'INTERVIEW',
        'OFFER',
        'REJECTED',
        'WITHDRAWN',
      ] as const
    ).includes(status as ManualApplicationTransition),
  );
}
