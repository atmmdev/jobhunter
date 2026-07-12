'use client';

import {
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useTransition } from 'react';

import { deleteJobAction, updateJobStatusAction } from '@/app/actions/job.actions';
import { createApplicationFromJobAction } from '@/app/actions/application.actions';
import { scoreJobAction } from '@/app/actions/scoring.actions';
import { Badge } from '@/components/ui/badge';
import { IconTooltipButton } from '@/components/ui/icon-tooltip-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { JobListItemDto } from '@/shared/dto/job.dto';
import type { JobStatusValue } from '@/modules/domain/job/job.entity';

interface JobsTableProps {
  jobs: JobListItemDto[];
}

const columnHelper = createColumnHelper<JobListItemDto>();

function statusVariant(
  status: JobStatusValue,
): 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' {
  switch (status) {
    case 'FAVORITED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'OFFER':
    case 'INTERVIEW':
      return 'warning';
    case 'APPLIED':
    case 'APPROVED':
      return 'default';
    default:
      return 'secondary';
  }
}

/**
 * TanStack Table for browsing and triaging jobs.
 */
export function JobsTable({ jobs }: JobsTableProps) {
  const t = useTranslations('jobs');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: t('columns.title'),
        cell: (info) => (
          <div className="max-w-xs">
            <div className="flex items-start gap-1.5">
              <p className="font-medium">{info.getValue()}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={info.row.original.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('actions.open')}
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>{t('actions.open')}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('companyName', {
        header: t('columns.company'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor((row) => row.location ?? row.country, {
        id: 'location',
        header: t('columns.location'),
        cell: (info) => {
          const job = info.row.original;
          const parts = [job.location, job.country].filter(Boolean);
          if (job.isRemote) {
            parts.push('Remote');
          }
          return parts.length > 0 ? parts.join(' · ') : '—';
        },
      }),
      columnHelper.accessor('status', {
        header: t('columns.status'),
        cell: (info) => (
          <Badge variant={statusVariant(info.getValue())}>
            {t(`status.${info.getValue()}`)}
          </Badge>
        ),
      }),
      columnHelper.accessor('sourceName', {
        header: t('columns.source'),
      }),
      columnHelper.accessor('score', {
        header: t('columns.score'),
        cell: (info) => {
          const score = info.getValue();
          const recommended = info.row.original.recommendedResumeName;
          if (score === null) {
            return '—';
          }
          return (
            <div>
              <p className="font-medium">{score}</p>
              {recommended ? (
                <p className="text-xs text-muted-foreground">{recommended}</p>
              ) : null}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: t('columns.actions'),
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="flex flex-wrap gap-0.5">
              <IconTooltipButton
                label={t('actions.score')}
                icon={Sparkles}
                variant="secondary"
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
                  variant="default"
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
                  variant="outline"
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
                  variant="ghost"
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
                  variant="secondary"
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
                variant="destructive"
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
                    router.refresh();
                  });
                }}
              />
            </div>
          );
        },
      }),
    ],
    [pending, router, t],
  );

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
