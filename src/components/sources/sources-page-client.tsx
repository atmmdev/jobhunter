'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { syncCompaniesAction } from '@/app/actions/company.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SourceListItemDto } from '@/shared/dto/source.dto';

interface SourcesPageClientProps {
  sources: SourceListItemDto[];
}

/**
 * Sources admin UI with sync-from-markdown action.
 */
export function SourcesPageClient({ sources }: SourcesPageClientProps) {
  const t = useTranslations('sources');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('total', { count: sources.length })}</p>
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
              router.refresh();
            })
          }
        >
          {t('sync')}
        </Button>
      </div>

      {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.name')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.company')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.ats')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.country')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.enabled')}</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">{t('columns.url')}</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
