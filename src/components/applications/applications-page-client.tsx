'use client';

import {
  Ban,
  Bot,
  CheckCircle2,
  CircleHelp,
  FileText,
  Handshake,
  Send,
  UserRound,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRouter } from '@/shared/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import {
  executeAutoApplyAction,
  transitionApplicationAction,
} from '@/app/actions/application.actions';
import { CoverLetterEditor } from '@/components/applications/cover-letter-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTooltipButton } from '@/components/ui/icon-tooltip-button';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ApplicationListItemDto } from '@/shared/dto/application.dto';
import type {
  ApplicationStatusValue,
  ManualApplicationTransition,
} from '@/modules/domain/application/application.entity';
import type { ActionIconTone } from '@/shared/ui/action-icon-tones';

interface ApplicationsPageClientProps {
  applications: ApplicationListItemDto[];
  total: number;
  status?: ApplicationStatusValue;
}

const TRANSITION_ICONS: Record<ManualApplicationTransition, LucideIcon> = {
  APPROVED: CheckCircle2,
  PENDING_APPLY: Send,
  APPLIED: Send,
  MANUAL_REQUIRED: CircleHelp,
  INTERVIEW: UserRound,
  OFFER: Handshake,
  REJECTED: XCircle,
  WITHDRAWN: Ban,
};

const TRANSITION_TONES: Record<ManualApplicationTransition, ActionIconTone> = {
  APPROVED: 'approve',
  PENDING_APPLY: 'pendingApply',
  APPLIED: 'applied',
  MANUAL_REQUIRED: 'manual',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'reject',
  WITHDRAWN: 'withdrawn',
};

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
  const [message, setMessage] = useState<string | null>(null);
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const [autoApplyingId, setAutoApplyingId] = useState<string | null>(null);

  const filterStatus = (next?: ApplicationStatusValue) => {
    const params = new URLSearchParams();
    if (next) {
      params.set('status', next);
    }
    router.push(`/applications${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <TooltipProvider delayDuration={300}>
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
        {message ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
        ) : null}

        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="overflow-x-auto rounded-lg border border-border">
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
                    <tr className="border-b border-border last:border-0">
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
                        <div className="flex flex-wrap items-center gap-1">
                          <IconTooltipButton
                            label={
                              app.coverLetterId ? t('coverLetter.edit') : t('coverLetter.open')
                            }
                            icon={FileText}
                            tone="coverLetter"
                            disabled={pending}
                            onClick={() =>
                              setEditingApplicationId((current) =>
                                current === app.id ? null : app.id,
                              )
                            }
                          />
                          {canAutoApply(app.status) ? (
                            <IconTooltipButton
                              label={t('actions.autoApply')}
                              icon={Bot}
                              tone="autoApply"
                              disabled={pending || autoApplyingId === app.id}
                              onClick={() =>
                                startTransition(async () => {
                                  setError(null);
                                  setMessage(null);
                                  setAutoApplyingId(app.id);
                                  const result = await executeAutoApplyAction({
                                    applicationId: app.id,
                                  });
                                  setAutoApplyingId(null);
                                  if (!result.ok) {
                                    setError(result.error);
                                    return;
                                  }
                                  setMessage(
                                    t('autoApplyResult', {
                                      status: result.data.status,
                                      provider: result.data.provider,
                                      reason: result.data.reason ?? '—',
                                    }),
                                  );
                                  router.refresh();
                                })
                              }
                            />
                          ) : null}
                          {app.allowedTransitions.map((next) => (
                            <IconTooltipButton
                              key={next}
                              label={t(`actions.${next}`)}
                              icon={TRANSITION_ICONS[next]}
                              tone={TRANSITION_TONES[next]}
                              disabled={pending}
                              onClick={() =>
                                startTransition(async () => {
                                  setError(null);
                                  setMessage(null);
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
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {editingApplicationId === app.id ? (
                  <div className="border-t border-border p-4">
                    <CoverLetterEditor
                      key={app.id}
                      applicationId={app.id}
                      coverLetterId={app.coverLetterId}
                      initialContent={app.coverLetterContent}
                      onClose={() => setEditingApplicationId(null)}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function canAutoApply(status: ApplicationStatusValue): boolean {
  return ['APPROVED', 'PENDING_APPLY', 'FAILED', 'MANUAL_REQUIRED'].includes(status);
}
