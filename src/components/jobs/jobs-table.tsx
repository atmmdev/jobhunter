'use client';

import { ExternalLink, Trash2 } from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';

import { deleteJobsAction } from '@/app/actions/job.actions';
import { JobRowActions } from '@/components/jobs/job-row-actions';
import { Badge } from '@/components/ui/badge';
import { IconTooltipButton } from '@/components/ui/icon-tooltip-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { JobListItemDto } from '@/shared/dto/job.dto';
import type { JobStatusValue } from '@/modules/domain/job/job.entity';
import { ACTION_ICON_TONES } from '@/shared/ui/action-icon-tones';
import { cn } from '@/shared/lib/utils';

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = jobs.length > 0 && selectedIds.size === jobs.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(jobs.map((job) => job.id)));
  };

  const toggleOne = (jobId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label={t('actions.selectAll')}
            className="h-4 w-4 rounded border-border"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleOne(row.original.id)}
            aria-label={t('actions.select')}
            className="h-4 w-4 rounded border-border"
          />
        ),
      }),
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
                    className={cn(
                      'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                      ACTION_ICON_TONES.view,
                    )}
                  >
                    <ExternalLink className="h-4 w-4" />
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
        cell: ({ row }) => (
          <JobRowActions
            job={row.original}
            onDeleted={(jobId) =>
              setSelectedIds((current) => {
                const next = new Set(current);
                next.delete(jobId);
                return next;
              })
            }
          />
        ),
      }),
    ],
    [allSelected, selectedIds, t],
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
      <div className="space-y-3">
        {selectedIds.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-sm text-muted-foreground">
              {t('actions.selected', { count: selectedIds.size })}
            </p>
            <IconTooltipButton
              label={t('actions.deleteSelected')}
              icon={Trash2}
              tone="delete"
              disabled={pending}
              onClick={() => {
                if (
                  !window.confirm(
                    t('actions.deleteSelectedConfirm', { count: selectedIds.size }),
                  )
                ) {
                  return;
                }
                startTransition(async () => {
                  const result = await deleteJobsAction({ jobIds: [...selectedIds] });
                  if (!result.ok) {
                    window.alert(result.error);
                    return;
                  }
                  setSelectedIds(new Set());
                  router.refresh();
                });
              }}
            />
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[960px] text-left text-sm">
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
      </div>
    </TooltipProvider>
  );
}
