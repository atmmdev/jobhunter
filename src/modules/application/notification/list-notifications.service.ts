import type { NotificationRepository } from '@/modules/domain/notification/notification.repository';

/**
 * Lists notifications for the signed-in user.
 */
export class ListNotificationsService {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(userId: string, limit = 10) {
    const [items, unreadCount] = await Promise.all([
      this.notifications.list({ userId, limit }),
      this.notifications.countUnread(userId),
    ]);
    return { items, unreadCount };
  }
}
