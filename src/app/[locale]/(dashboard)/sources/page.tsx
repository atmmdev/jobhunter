import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SourcesPageClient } from '@/components/sources/sources-page-client';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createCompanyModule } from '@/modules/infrastructure/composition';
import { toSourceListItemDto } from '@/shared/dto/source.dto';

/**
 * Sources admin page — sync companies and browse crawl sources.
 */
export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('sources');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { listSources } = createCompanyModule();
  const sources = await listSources.execute();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <SourcesPageClient sources={sources.map(toSourceListItemDto)} />
    </div>
  );
}
