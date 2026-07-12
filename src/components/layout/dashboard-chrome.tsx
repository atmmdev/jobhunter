import type { ReactNode } from 'react';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { NotificationsPanel } from '@/components/layout/notifications-panel';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createNotificationModule } from '@/modules/infrastructure/composition';
import { toNotificationListItemDto } from '@/shared/dto/notification.dto';

/**
 * Authenticated dashboard chrome with sidebar and notifications.
 */
export async function DashboardChrome({ children }: { children: ReactNode }) {
  const session = await auth();
  const notificationData =
    session?.user?.id
      ? await createNotificationModule().listNotifications.execute(session.user.id, 8)
      : { items: [], unreadCount: 0 };

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        notifications={
          <NotificationsPanel
            notifications={notificationData.items.map(toNotificationListItemDto)}
            unreadCount={notificationData.unreadCount}
          />
        }
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
