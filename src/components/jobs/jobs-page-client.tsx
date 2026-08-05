'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { CreateJobForm } from '@/components/jobs/create-job-form';
import { JobsTable } from '@/components/jobs/jobs-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useRouter } from '@/shared/i18n/navigation';
import type { JobListItemDto } from '@/shared/dto/job.dto';
import type { JobStatusValue } from '@/modules/domain/job/job.entity';

interface JobsPageClientProps {
  jobs: JobListItemDto[];
  total: number;
  status?: JobStatusValue;
  search?: string;
}

const STATUS_OPTIONS: JobStatusValue[] = [
  'NEW',
  'SCORED',
  'FAVORITED',
  'REJECTED',
  'APPROVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'CLOSED',
];

/**
 * Client shell for jobs filters, create form, and table.
 */
export function JobsPageClient({ jobs, total, status, search }: JobsPageClientProps) {
  const t = useTranslations('jobs');
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [localSearch, setLocalSearch] = useState(search ?? '');
  const [localStatus, setLocalStatus] = useState<string>(status ?? '');
  const [pending, startTransition] = useTransition();

  const applyFilters = (overrides?: { search?: string; status?: string }) => {
    const nextSearch = overrides?.search ?? localSearch;
    const nextStatus = overrides?.status ?? localStatus;

    const params = new URLSearchParams();
    if (nextSearch.trim()) {
      params.set('search', nextSearch.trim());
    }
    if (nextStatus) {
      params.set('status', nextStatus);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/jobs?${query}` : '/jobs');
    });
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('add')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateJobForm
              onCancel={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <form
          className="flex flex-1 flex-wrap items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <div className="relative w-full sm:w-80">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              className="pl-9"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              placeholder={t('search')}
              aria-label={t('search')}
            />
          </div>
          <Select
            className="w-full sm:w-56"
            value={localStatus}
            onChange={(event) => {
              const nextStatus = event.target.value;
              setLocalStatus(nextStatus);
              applyFilters({ status: nextStatus });
            }}
            aria-label={t('filterStatus')}
          >
            <option value="">{t('allStatuses')}</option>
            {STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" disabled={pending}>
            {t('searchButton')}
          </Button>
        </form>
        <Button type="button" onClick={() => setShowForm((value) => !value)}>
          {t('add')}
        </Button>
      </div>

      <JobsTable jobs={jobs} />
    </div>
  );
}
