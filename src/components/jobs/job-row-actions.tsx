'use client';

import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { deleteJobAction, updateJobStatusAction } from '@/app/actions/job.actions';
import { createApplicationFromJobAction } from '@/app/actions/application.actions';
import { scoreJobAction } from '@/app/actions/scoring.actions';
import { IconTooltipButton } from '@/components/ui/icon-tooltip-button';
import type { JobListItemDto } from '@/shared/dto/job.dto';

interface JobRowActionsProps {
  job: JobListItemDto;
  onDeleted?: (jobId: string) => void;
}

/**
 * Colored flat icon actions for a single jobs table row.
 */
export function JobRowActions({ job, onDeleted }: JobRowActionsProps) {
  const t = useTranslations('jobs');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-1">
      <IconTooltipButton
        label={t('actions.score')}
        icon={Sparkles}
        tone="score"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await scoreJobAction({ jobId: job.id });
            router.refresh();
          })
        }
      />
      {job.status !== 'APPROVED' &&
      job.status !== 'APPLIED' &&
      job.status !== 'INTERVIEW' &&
      job.status !== 'OFFER' &&
      job.status !== 'CLOSED' ? (
        <IconTooltipButton
          label={t('actions.approve')}
          icon={CheckCircle2}
          tone="approve"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await createApplicationFromJobAction({ jobId: job.id });
              router.refresh();
            })
          }
        />
      ) : null}
      {job.status !== 'FAVORITED' ? (
        <IconTooltipButton
          label={t('actions.favorite')}
          icon={Star}
          tone="favorite"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateJobStatusAction({ jobId: job.id, status: 'FAVORITED' });
              router.refresh();
            })
          }
        />
      ) : null}
      {job.status !== 'REJECTED' ? (
        <IconTooltipButton
          label={t('actions.reject')}
          icon={XCircle}
          tone="reject"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateJobStatusAction({ jobId: job.id, status: 'REJECTED' });
              router.refresh();
            })
          }
        />
      ) : null}
      {job.status === 'FAVORITED' || job.status === 'REJECTED' ? (
        <IconTooltipButton
          label={t('actions.restore')}
          icon={RotateCcw}
          tone="restore"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateJobStatusAction({ jobId: job.id, status: 'NEW' });
              router.refresh();
            })
          }
        />
      ) : null}
      <IconTooltipButton
        label={t('actions.delete')}
        icon={Trash2}
        tone="delete"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(t('actions.deleteConfirm'))) {
            return;
          }
          startTransition(async () => {
            const result = await deleteJobAction({ jobId: job.id });
            if (!result.ok) {
              window.alert(result.error);
              return;
            }
            onDeleted?.(job.id);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
