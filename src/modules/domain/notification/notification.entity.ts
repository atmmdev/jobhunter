/**
 * In-app notification for the signed-in user.
 */
export interface NotificationEntity {
  readonly id: string;
  readonly userId: string;
  readonly type: string;
  readonly title: string;
  readonly body: string;
  readonly payload: Record<string, unknown> | null;
  readonly readAt: Date | null;
  readonly createdAt: Date;
}

export const NOTIFICATION_TYPES = {
  HIGH_SCORE_JOB: 'HIGH_SCORE_JOB',
} as const;
