'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
  const [localStatus, setLocalStatus] = useState(status ?? '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (localSearch.trim()) {
      params.set('search', localSearch.trim());
    }
    if (localStatus) {
      params.set('status', localStatus);
    }
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : '/jobs');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('total', { count: total })}</p>
        <Button type="button" onClick={() => setShowForm((value) => !value)}>
          {t('add')}
        </Button>
      </div>

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

      <div className="flex flex-wrap gap-3">
        <Input
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder={t('search')}
          className="max-w-sm"
        />
        <Select
          value={localStatus}
          onChange={(event) => setLocalStatus(event.target.value)}
          className="max-w-[200px]"
          aria-label={t('filterStatus')}
        >
          <option value="">{t('allStatuses')}</option>
          {STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {t(`status.${value}`)}
            </option>
          ))}
        </Select>
        <Button type="button" variant="secondary" onClick={applyFilters}>
          {t('filterStatus')}
        </Button>
      </div>

      <JobsTable jobs={jobs} />
    </div>
  );
}
