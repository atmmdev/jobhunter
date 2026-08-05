'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { syncCompaniesAction } from '@/app/actions/company.actions';
import { SourceRowActions } from '@/components/sources/source-row-actions';
import { SourcesScrapeHistory } from '@/components/sources/sources-scrape-history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRouter } from '@/shared/i18n/navigation';
import type { ScrapeRunListItemDto } from '@/shared/dto/scrape-run.dto';
import type { SourceListItemDto } from '@/shared/dto/source.dto';
import type { SourceSortBy } from '@/shared/schemas/source.schema';

interface SourcesPageClientProps {
  sources: SourceListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: SourceSortBy;
  sortDir: 'asc' | 'desc';
  search?: string;
  scrapeRuns: ScrapeRunListItemDto[];
}

const SORTABLE_COLUMNS: SourceSortBy[] = [
  'name',
  'company',
  'ats',
  'country',
  'enabled',
  'url',
];

/**
 * Sources admin UI with sync, scrape run, enable toggle, history, sort, and pagination.
 */
export function SourcesPageClient({
  sources,
  total,
  page,
  pageSize,
  sortBy,
  sortDir,
  search,
  scrapeRuns,
}: SourcesPageClientProps) {
  const t = useTranslations('sources');
  const router = useRouter();
  const nextRouter = useNextRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(search ?? '');

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hasSearch = Boolean(search?.trim());

  const navigate = (next: {
    page?: number;
    sortBy?: SourceSortBy;
    sortDir?: 'asc' | 'desc';
    search?: string;
  }) => {
    const params = new URLSearchParams();
    params.set('page', String(next.page ?? page));
    params.set('pageSize', String(pageSize));
    params.set('sortBy', next.sortBy ?? sortBy);
    params.set('sortDir', next.sortDir ?? sortDir);
    const nextSearch = (next.search ?? search ?? '').trim();
    if (nextSearch) {
      params.set('search', nextSearch);
    }
    router.push(`/sources?${params.toString()}`);
  };

  const applySearch = () => {
    navigate({ page: 1, search: localSearch.trim() });
  };

  const toggleSort = (column: SourceSortBy) => {
    if (sortBy === column) {
      navigate({ page: 1, sortBy: column, sortDir: sortDir === 'asc' ? 'desc' : 'asc' });
      return;
    }
    navigate({ page: 1, sortBy: column, sortDir: 'asc' });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  setMessage(null);
                  const result = await syncCompaniesAction();
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  setMessage(
                    t('syncResult', {
                      parsed: result.data.totalParsed,
                      created: result.data.companiesCreated,
                      updated: result.data.companiesUpdated,
                      sources: result.data.sourcesCreated,
                    }),
                  );
                  nextRouter.refresh();
                })
              }
            >
              {t('sync')}
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Input
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applySearch();
                }
              }}
              placeholder={t('search')}
              className="max-w-sm"
              aria-label={t('search')}
            />
            <Button type="button" variant="secondary" onClick={applySearch}>
              {t('searchAction')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">{t('runHint')}</p>

          {message ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {total === 0 ? (
            <p className="text-sm text-muted-foreground">
              {hasSearch ? t('emptySearch') : t('empty')}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[1080px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      {SORTABLE_COLUMNS.map((column) => (
                        <th key={column} className="px-4 py-3">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
                            onClick={() => toggleSort(column)}
                          >
                            {t(`columns.${column}`)}
                            <SortIcon active={sortBy === column} direction={sortDir} />
                          </button>
                        </th>
                      ))}
                      <th className="px-4 py-3 font-medium text-muted-foreground">
                        {t('columns.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={source.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 align-top font-medium">{source.name}</td>
                        <td className="px-4 py-3 align-top">{source.companyName ?? '—'}</td>
                        <td className="px-4 py-3 align-top">
                          <Badge variant="secondary">{source.atsType ?? source.type}</Badge>
                        </td>
                        <td className="px-4 py-3 align-top">{source.country ?? '—'}</td>
                        <td className="px-4 py-3 align-top">
                          <Badge variant={source.enabled ? 'success' : 'outline'}>
                            {source.enabled ? t('enabled') : t('disabled')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <a
                            href={source.baseUrl.startsWith('http') ? source.baseUrl : undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-xs text-muted-foreground underline-offset-2 hover:underline"
                          >
                            {source.baseUrl}
                          </a>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <SourceRowActions
                            source={source}
                            onMessage={setMessage}
                            onError={setError}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {t('pageOf', { page, totalPages })}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => navigate({ page: page - 1 })}
                  >
                    {t('previous')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => navigate({ page: page + 1 })}
                  >
                    {t('next')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <SourcesScrapeHistory scrapeRuns={scrapeRuns} />
      </div>
    </TooltipProvider>
  );
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: 'asc' | 'desc';
}) {
  if (!active) {
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
  }
  return direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" />
  );
}
