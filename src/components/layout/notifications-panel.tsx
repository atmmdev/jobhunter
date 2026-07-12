'use client';

import { Bell, Briefcase, Check } from 'lucide-react';
import { useRouter } from '@/shared/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { markNotificationReadAction } from '@/app/actions/notification.actions';
import { IconTooltipButton } from '@/components/ui/icon-tooltip-button';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { NotificationListItemDto } from '@/shared/dto/notification.dto';

interface NotificationsPanelProps {
  notifications: NotificationListItemDto[];
  unreadCount: number;
}

/**
 * Sidebar notifications list with mark-as-read actions.
 */
export function NotificationsPanel({ notifications, unreadCount }: NotificationsPanelProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border-t border-border p-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="inline-flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t('title')}
          </span>
          {unreadCount > 0 ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {unreadCount}
            </span>
          ) : null}
        </button>

        {open ? (
          <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-2 text-xs text-muted-foreground">{t('empty')}</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-md border px-2 py-2 text-xs ${
                    notification.readAt
                      ? 'border-border bg-background'
                      : 'border-primary/30 bg-primary/5'
                  }`}
                >
                  <p className="font-medium">{notification.title}</p>
                  <p className="mt-1 text-muted-foreground">{notification.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {notification.jobId ? (
                      <IconTooltipButton
                        label={t('viewJobs')}
                        icon={Briefcase}
                        tone="view"
                        onClick={() => router.push('/jobs')}
                      />
                    ) : null}
                    {!notification.readAt ? (
                      <IconTooltipButton
                        label={t('markRead')}
                        icon={Check}
                        tone="markRead"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await markNotificationReadAction({
                              notificationId: notification.id,
                            });
                            router.refresh();
                          })
                        }
                      />
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
