'use client';

import { useRouter } from '@/shared/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { transitionApplicationAction } from '@/app/actions/application.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ApplicationListItemDto } from '@/shared/dto/application.dto';
import type { ApplicationStatusValue } from '@/modules/domain/application/application.entity';

interface ApplicationsPageClientProps {
  applications: ApplicationListItemDto[];
  total: number;
  status?: ApplicationStatusValue;
}

function statusVariant(
  status: ApplicationStatusValue,
): 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' {
  switch (status) {
    case 'APPROVED':
    case 'APPLIED':
    case 'OFFER':
      return 'success';
    case 'REJECTED':
    case 'FAILED':
    case 'WITHDRAWN':
      return 'danger';
    case 'INTERVIEW':
    case 'MANUAL_REQUIRED':
    case 'PENDING_APPROVAL':
      return 'warning';
    default:
      return 'secondary';
  }
}

/**
 * Applications approval queue and status transition UI.
 */
export function ApplicationsPageClient({
  applications,
  total,
  status,
}: ApplicationsPageClientProps) {
  const t = useTranslations('applications');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filterStatus = (next?: ApplicationStatusValue) => {
    const params = new URLSearchParams();
    if (next) {
      params.set('status', next);
    }
    router.push(`/applications${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('total', { count: total })}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={!status ? 'default' : 'outline'}
            onClick={() => filterStatus(undefined)}
          >
            {t('allStatuses')}
          </Button>
          {(
            [
              'PENDING_APPROVAL',
              'APPROVED',
              'APPLIED',
              'INTERVIEW',
              'OFFER',
              'MANUAL_REQUIRED',
            ] as const
          ).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={status === value ? 'default' : 'outline'}
              onClick={() => filterStatus(value)}
            >
              {t(`status.${value}`)}
            </Button>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.job')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.company')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.resume')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.status')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.updated')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 align-top">
                    <a
                      href={app.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {app.jobTitle}
                    </a>
                  </td>
                  <td className="px-4 py-3 align-top">{app.companyName ?? '—'}</td>
                  <td className="px-4 py-3 align-top">{app.resumeName}</td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant={statusVariant(app.status)}>{t(`status.${app.status}`)}</Badge>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {new Date(app.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {app.allowedTransitions.map((next) => (
                        <Button
                          key={next}
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              setError(null);
                              const result = await transitionApplicationAction({
                                applicationId: app.id,
                                status: next,
                              });
                              if (!result.ok) {
                                setError(result.error);
                                return;
                              }
                              router.refresh();
                            })
                          }
                        >
                          {t(`actions.${next}`)}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
