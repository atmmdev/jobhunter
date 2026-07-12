'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useTransition } from 'react';

import { updateJobStatusAction } from '@/app/actions/job.actions';
import { scoreJobAction } from '@/app/actions/scoring.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
            <p className="font-medium">{info.getValue()}</p>
            <a
              href={info.row.original.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              {t('actions.open')}
            </a>
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
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await scoreJobAction({ jobId: job.id });
                    router.refresh();
                  })
                }
              >
                {t('actions.score')}
              </Button>
              {job.status !== 'FAVORITED' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await updateJobStatusAction({ jobId: job.id, status: 'FAVORITED' });
                      router.refresh();
                    })
                  }
                >
                  {t('actions.favorite')}
                </Button>
              ) : null}
              {job.status !== 'REJECTED' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await updateJobStatusAction({ jobId: job.id, status: 'REJECTED' });
                      router.refresh();
                    })
                  }
                >
                  {t('actions.reject')}
                </Button>
              ) : null}
              {job.status === 'FAVORITED' || job.status === 'REJECTED' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await updateJobStatusAction({ jobId: job.id, status: 'NEW' });
                      router.refresh();
                    })
                  }
                >
                  {t('actions.restore')}
                </Button>
              ) : null}
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
  );
}
