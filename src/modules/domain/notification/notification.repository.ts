import type { NotificationEntity } from '@/modules/domain/notification/notification.entity';

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown> | null;
}

export interface ListNotificationsFilter {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
}

/**
 * Persistence port for in-app notifications.
 */
export interface NotificationRepository {
  list(filter: ListNotificationsFilter): Promise<NotificationEntity[]>;
  countUnread(userId: string): Promise<number>;
  existsForJobScore(userId: string, jobId: string): Promise<boolean>;
  create(input: CreateNotificationInput): Promise<NotificationEntity>;
  markRead(id: string, userId: string): Promise<NotificationEntity | null>;
  markAllRead(userId: string): Promise<number>;
}
