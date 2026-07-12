import type { Notification as PrismaNotification } from '@prisma/client';

import type { NotificationEntity } from '@/modules/domain/notification/notification.entity';
import type {
  CreateNotificationInput,
  ListNotificationsFilter,
  NotificationRepository,
} from '@/modules/domain/notification/notification.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

function mapNotification(row: PrismaNotification): NotificationEntity {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    payload:
      row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : null,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

/**
 * Prisma implementation of the Notification repository port.
 */
export class PrismaNotificationRepository implements NotificationRepository {
  async list(filter: ListNotificationsFilter): Promise<NotificationEntity[]> {
    const rows = await prisma.notification.findMany({
      where: {
        userId: filter.userId,
        ...(filter.unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit ?? 20,
    });
    return rows.map(mapNotification);
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async existsForJobScore(userId: string, jobId: string): Promise<boolean> {
    const row = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'HIGH_SCORE_JOB',
        payload: {
          path: '$.jobId',
          equals: jobId,
        },
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  async create(input: CreateNotificationInput): Promise<NotificationEntity> {
    const row = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        payload: input.payload
          ? (JSON.parse(JSON.stringify(input.payload)) as object)
          : undefined,
      },
    });
    return mapNotification(row);
  }

  async markRead(id: string, userId: string): Promise<NotificationEntity | null> {
    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return null;
    }

    const row = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return mapNotification(row);
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }
}
