import { getTranslations, setRequestLocale } from 'next-intl/server';

import { JobsPageClient } from '@/components/jobs/jobs-page-client';
import { createJobModule } from '@/modules/infrastructure/composition';
import { auth } from '@/modules/infrastructure/auth/auth';
import type { JobStatusValue } from '@/modules/domain/job/job.entity';
import { toJobListItemDto } from '@/shared/dto/job.dto';
import { listJobsQuerySchema } from '@/shared/schemas/job.schema';

/**
 * Jobs management page — list, filter, create, favorite/reject.
 */
export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('jobs');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const raw = await searchParams;
  const query = listJobsQuerySchema.parse({
    status: typeof raw.status === 'string' ? raw.status : undefined,
    search: typeof raw.search === 'string' ? raw.search : undefined,
    limit: 50,
    offset: 0,
  });

  const { listJobs } = createJobModule();
  const result = await listJobs.execute(query);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <JobsPageClient
        jobs={result.items.map(toJobListItemDto)}
        total={result.total}
        status={query.status as JobStatusValue | undefined}
        search={query.search}
      />
    </div>
  );
}
