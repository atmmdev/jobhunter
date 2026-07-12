import type { NotificationRepository } from '@/modules/domain/notification/notification.repository';
import { NotFoundError } from '@/modules/domain/shared/errors';

/**
 * Marks one notification as read for the signed-in user.
 */
export class MarkNotificationReadService {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(userId: string, notificationId: string) {
    const updated = await this.notifications.markRead(notificationId, userId);
    if (!updated) {
      throw new NotFoundError('Notification', notificationId);
    }
    return updated;
  }
}
