import { getTranslations, setRequestLocale } from 'next-intl/server';

import { JobsPageClient } from '@/components/jobs/jobs-page-client';
import { createJobModule } from '@/modules/infrastructure/composition';
import { auth } from '@/modules/infrastructure/auth/auth';
import type { JobStatusValue } from '@/modules/domain/job/job.entity';
import { prisma } from '@/modules/infrastructure/prisma/client';
import { toJobListItemDto } from '@/shared/dto/job.dto';
import { listJobsQuerySchema } from '@/shared/schemas/job.schema';

/**
 * Jobs management page — list, filter, create, favorite/reject, score.
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
  const jobIds = result.items.map((job) => job.id);

  const [scores, matches] = await Promise.all([
    jobIds.length
      ? prisma.jobScore.findMany({
          where: { userId: session.user.id, jobId: { in: jobIds } },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    jobIds.length
      ? prisma.jobResumeMatch.findMany({
          where: { jobId: { in: jobIds }, isRecommended: true },
          include: { resume: { select: { name: true, locale: true } } },
        })
      : Promise.resolve([]),
  ]);

  const latestScoreByJob = new Map<string, number>();
  for (const score of scores) {
    if (!latestScoreByJob.has(score.jobId)) {
      latestScoreByJob.set(score.jobId, score.score);
    }
  }

  const recommendedByJob = new Map<string, string>();
  for (const match of matches) {
    recommendedByJob.set(
      match.jobId,
      `${match.resume.name} (${match.resume.locale === 'pt_BR' ? 'pt-BR' : 'en'})`,
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <JobsPageClient
        jobs={result.items.map((job) =>
          toJobListItemDto(job, {
            score: latestScoreByJob.get(job.id) ?? null,
            recommendedResumeName: recommendedByJob.get(job.id) ?? null,
          }),
        )}
        total={result.total}
        status={query.status as JobStatusValue | undefined}
        search={query.search}
      />
    </div>
  );
}
