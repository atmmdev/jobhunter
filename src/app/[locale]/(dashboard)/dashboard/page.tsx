import {
  Briefcase,
  CalendarCheck,
  CircleX,
  type LucideIcon,
  Percent,
  Send,
  Star,
  Trophy,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { FocusCountriesPanel } from '@/components/dashboard/focus-countries-panel';
import { MetricCard } from '@/components/dashboard/metric-card';
import { StackTechnologiesCard } from '@/components/dashboard/stack-technologies-card';
import type { FocusCountryRegion } from '@/modules/domain/analytics/focus-countries';
import { listStackTechnologies } from '@/modules/domain/resume/stack-technologies';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createAnalyticsModule, createResumeModule } from '@/modules/infrastructure/composition';
import type { MetricCardTone } from '@/shared/ui/metric-card-tones';

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
  const { listResumes } = createResumeModule();
  const [stats, resumes] = await Promise.all([
    getDashboardStats.execute(),
    listResumes.execute(session.user.id),
  ]);

  const stackTechnologies = listStackTechnologies(
    resumes.filter((resume) => resume.isActive).map((resume) => resume.stack),
  );

  type MetricCardModel = {
    key: MetricCardTone;
    value: string;
    hint?: string;
    icon: LucideIcon;
  };

  const counterCards: MetricCardModel[] = [
    { key: 'jobsFound', value: String(stats.jobsFound), icon: Briefcase },
    { key: 'applications', value: String(stats.applications), icon: Send },
    { key: 'favorites', value: String(stats.favorites), icon: Star },
    { key: 'rejected', value: String(stats.rejected), icon: CircleX },
    { key: 'interviews', value: String(stats.interviews), icon: CalendarCheck },
    { key: 'offers', value: String(stats.offers), icon: Trophy },
  ];

  const insightCards: MetricCardModel[] = [
    {
      key: 'responseRate',
      value: stats.responseRate === null ? t('emptyValue') : `${stats.responseRate}%`,
      icon: Percent,
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
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {counterCards.map((card) => (
          <MetricCard
            key={card.key}
            title={t(card.key)}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            tone={card.key}
          />
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {insightCards.map((card) => (
          <MetricCard
            key={card.key}
            title={t(card.key)}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            tone={card.key}
          />
        ))}
        <StackTechnologiesCard
          title={t('stackTechnologies')}
          technologies={stackTechnologies}
          emptyLabel={t('stackTechnologiesEmpty')}
          className="md:col-span-2"
        />
      </section>
      <FocusCountriesPanel
        locale={locale}
        title={t('focusCountriesTitle')}
        subtitle={t('focusCountriesSubtitle')}
        regionLabels={regionLabels}
        formatCountLabel={(count) => t('focusJobsBadge', { count })}
        jobCountsByCountry={jobCountsByCountry}
      />
    </div>
  );
}
