'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import type { ScrapeRunListItemDto } from '@/shared/dto/scrape-run.dto';

interface SourcesScrapeHistoryProps {
  scrapeRuns: ScrapeRunListItemDto[];
}

/**
 * Recent scrape runs table for the Sources admin page.
 */
export function SourcesScrapeHistory({ scrapeRuns }: SourcesScrapeHistoryProps) {
  const t = useTranslations('sources');

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{t('historyTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('historySubtitle')}</p>
      </div>
      {scrapeRuns.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('historyEmpty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  {t('historyColumns.source')}
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  {t('historyColumns.status')}
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  {t('historyColumns.found')}
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  {t('historyColumns.upserted')}
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  {t('historyColumns.started')}
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  {t('historyColumns.error')}
                </th>
              </tr>
            </thead>
            <tbody>
              {scrapeRuns.map((run) => (
                <tr key={run.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 align-top font-medium">{run.sourceName}</td>
                  <td className="px-4 py-3 align-top">
                    <Badge
                      variant={
                        run.status === 'SUCCESS'
                          ? 'success'
                          : run.status === 'FAILED'
                            ? 'danger'
                            : 'secondary'
                      }
                    >
                      {t(`runStatus.${run.status}`)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-top">{run.jobsFound}</td>
                  <td className="px-4 py-3 align-top">{run.jobsUpserted}</td>
                  <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {new Date(run.startedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {run.errorSummary ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
