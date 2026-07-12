import { getTranslations, setRequestLocale } from 'next-intl/server';

import { MetricCard } from '@/components/dashboard/metric-card';

/**
 * Main dashboard with placeholder analytics metrics.
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  const metrics = [
    'jobsFound',
    'applications',
    'favorites',
    'rejected',
    'interviews',
    'offers',
    'responseRate',
    'topTechnologies',
    'salaryAnalytics',
    'countries',
    'atsStatistics',
  ] as const;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="max-w-2xl text-muted-foreground">{t('subtitle')}</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {metrics.map((key) => (
          <MetricCard
            key={key}
            title={t(key)}
            value={t('emptyValue')}
            hint={t('comingSoon')}
          />
        ))}
      </section>
    </div>
  );
}
