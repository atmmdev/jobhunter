import { getTranslations, setRequestLocale } from 'next-intl/server';

import { FocusCountriesPanel } from '@/components/dashboard/focus-countries-panel';
import { MetricCard } from '@/components/dashboard/metric-card';
import type { FocusCountryRegion } from '@/modules/domain/analytics/focus-countries';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createAnalyticsModule } from '@/modules/infrastructure/composition';

/**
 * Main dashboard with live analytics metrics and relocation focus countries.
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { getDashboardStats } = createAnalyticsModule();
  const stats = await getDashboardStats.execute();

  const cards: Array<{ key: string; value: string; hint?: string }> = [
    { key: 'jobsFound', value: String(stats.jobsFound) },
    { key: 'applications', value: String(stats.applications) },
    { key: 'favorites', value: String(stats.favorites) },
    { key: 'rejected', value: String(stats.rejected) },
    { key: 'interviews', value: String(stats.interviews) },
    { key: 'offers', value: String(stats.offers) },
    {
      key: 'responseRate',
      value: stats.responseRate === null ? t('emptyValue') : `${stats.responseRate}%`,
    },
    {
      key: 'topTechnologies',
      value:
        stats.topTechnologies.length === 0
          ? t('emptyValue')
          : stats.topTechnologies.map((item) => item.name).slice(0, 3).join(', '),
      hint:
        stats.topTechnologies.length > 0
          ? stats.topTechnologies.map((item) => `${item.name} (${item.count})`).join(' · ')
          : undefined,
    },
    {
      key: 'salaryAnalytics',
      value:
        stats.averageSalaryMin === null && stats.averageSalaryMax === null
          ? t('emptyValue')
          : `${formatSalary(stats.averageSalaryMin)} – ${formatSalary(stats.averageSalaryMax)}`,
    },
    {
      key: 'countries',
      value:
        stats.countries.length === 0
          ? t('emptyValue')
          : stats.countries.map((item) => item.name).slice(0, 3).join(', '),
      hint:
        stats.countries.length > 0
          ? stats.countries.map((item) => `${item.name} (${item.count})`).join(' · ')
          : undefined,
    },
    {
      key: 'atsStatistics',
      value:
        stats.atsStatistics.length === 0
          ? t('emptyValue')
          : stats.atsStatistics.map((item) => item.name).slice(0, 3).join(', '),
      hint:
        stats.atsStatistics.length > 0
          ? stats.atsStatistics.map((item) => `${item.name} (${item.count})`).join(' · ')
          : undefined,
    },
  ];

  const regionLabels: Record<FocusCountryRegion, string> = {
    europe: t('focusRegions.europe'),
    oceania: t('focusRegions.oceania'),
    northAmerica: t('focusRegions.northAmerica'),
    southAmerica: t('focusRegions.southAmerica'),
    asia: t('focusRegions.asia'),
    middleEast: t('focusRegions.middleEast'),
  };

  const jobCountsByCountry = Object.fromEntries(
    stats.countries.map((item) => [item.name, item.count]),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="max-w-2xl text-muted-foreground">{t('subtitle')}</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.key} title={t(card.key)} value={card.value} hint={card.hint} />
        ))}
      </section>
      <FocusCountriesPanel
        locale={locale}
        title={t('focusCountriesTitle')}
        subtitle={t('focusCountriesSubtitle')}
        regionLabels={regionLabels}
        jobCountsByCountry={jobCountsByCountry}
      />
    </div>
  );
}

function formatSalary(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }
  return Math.round(value).toLocaleString();
}
