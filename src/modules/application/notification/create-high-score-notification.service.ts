import {
  NOTIFICATION_TYPES,
  type NotificationEntity,
} from '@/modules/domain/notification/notification.entity';
import type { NotificationRepository } from '@/modules/domain/notification/notification.repository';

/**
 * Creates an in-app notification when a job score crosses the configured threshold.
 */
export class CreateHighScoreNotificationService {
  constructor(
    private readonly notifications: NotificationRepository,
    private readonly threshold: number,
  ) {}

  async execute(input: {
    userId: string;
    jobId: string;
    jobTitle: string;
    companyName: string | null;
    score: number;
  }): Promise<NotificationEntity | null> {
    if (input.score < this.threshold) {
      return null;
    }

    const exists = await this.notifications.existsForJobScore(input.userId, input.jobId);
    if (exists) {
      return null;
    }

    const company = input.companyName ? ` at ${input.companyName}` : '';

    return this.notifications.create({
      userId: input.userId,
      type: NOTIFICATION_TYPES.HIGH_SCORE_JOB,
      title: `High match: ${input.score}`,
      body: `${input.jobTitle}${company} scored ${input.score}/100.`,
      payload: {
        jobId: input.jobId,
        score: input.score,
      },
    });
  }
}
