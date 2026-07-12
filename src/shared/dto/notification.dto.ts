import type { NotificationEntity } from '@/modules/domain/notification/notification.entity';

/**
 * JSON-safe notification DTO for Client Components.
 */
export interface NotificationListItemDto {
  id: string;
  type: string;
  title: string;
  body: string;
  jobId: string | null;
  score: number | null;
  readAt: string | null;
  createdAt: string;
}

/**
 * Maps a Notification entity to a serializable DTO.
 */
export function toNotificationListItemDto(
  notification: NotificationEntity,
): NotificationListItemDto {
  const jobId =
    typeof notification.payload?.jobId === 'string' ? notification.payload.jobId : null;
  const score =
    typeof notification.payload?.score === 'number' ? notification.payload.score : null;

  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    jobId,
    score,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}
