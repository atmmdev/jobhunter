import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SourcesPageClient } from '@/components/sources/sources-page-client';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createCompanyModule } from '@/modules/infrastructure/composition';
import { toSourceListItemDto } from '@/shared/dto/source.dto';
import { listSourcesQuerySchema } from '@/shared/schemas/source.schema';

/**
 * Sources admin page — sync companies and browse crawl sources.
 */
export default async function SourcesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('sources');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const raw = await searchParams;
  const query = listSourcesQuerySchema.parse({
    page: typeof raw.page === 'string' ? raw.page : undefined,
    pageSize: typeof raw.pageSize === 'string' ? raw.pageSize : 20,
    sortBy: typeof raw.sortBy === 'string' ? raw.sortBy : undefined,
    sortDir: typeof raw.sortDir === 'string' ? raw.sortDir : undefined,
  });

  const { listSources } = createCompanyModule();
  const result = await listSources.execute(query);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <SourcesPageClient
        sources={result.items.map(toSourceListItemDto)}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        sortBy={query.sortBy}
        sortDir={query.sortDir}
      />
    </div>
  );
}
