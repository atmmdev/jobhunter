'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import {
  deleteVaultSecretAction,
  upsertVaultSecretAction,
} from '@/app/actions/credential.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VAULT_PROVIDERS } from '@/shared/schemas/credential-vault.schema';

export interface VaultEntryView {
  provider: string;
  updatedAt: string;
}

interface CredentialVaultPanelProps {
  entries: VaultEntryView[];
  encryptionConfigured: boolean;
  className?: string;
}

/**
 * Settings panel to manage encrypted Playwright storage-state secrets.
 */
export function CredentialVaultPanel({
  entries,
  encryptionConfigured,
  className,
}: CredentialVaultPanelProps) {
  const t = useTranslations('settings.vault');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [provider, setProvider] = useState<(typeof VAULT_PROVIDERS)[number]>('generic');
  const [storageStateJson, setStorageStateJson] = useState('{"cookies":[],"origins":[]}');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!encryptionConfigured ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">{t('encryptionMissing')}</p>
        ) : null}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('saved')}</h3>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.provider}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{entry.provider}</div>
                    <div className="text-muted-foreground">
                      {t('updatedAt', { date: new Date(entry.updatedAt).toLocaleString() })}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        setError(null);
                        setMessage(null);
                        const result = await deleteVaultSecretAction({
                          provider: entry.provider,
                        });
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        setMessage(t('deleted'));
                        router.refresh();
                      })
                    }
                  >
                    {t('delete')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="vault-provider">{t('provider')}</Label>
            <Select
              id="vault-provider"
              className="w-56"
              value={provider}
              onChange={(event) =>
                setProvider(event.target.value as (typeof VAULT_PROVIDERS)[number])
              }
            >
              {VAULT_PROVIDERS.map((item) => (
                <option key={item} value={item}>
                  {t(`providers.${item}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vault-json">{t('json')}</Label>
            <Textarea
              id="vault-json"
              value={storageStateJson}
              onChange={(event) => setStorageStateJson(event.target.value)}
              rows={8}
              className="font-mono text-xs"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">{t('jsonHint')}</p>
          </div>
          <Button
            type="button"
            disabled={pending || !encryptionConfigured}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                setMessage(null);
                const result = await upsertVaultSecretAction({
                  provider,
                  storageStateJson,
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setMessage(t('savedOk'));
                setStorageStateJson('{"cookies":[],"origins":[]}');
                router.refresh();
              })
            }
          >
            {t('save')}
          </Button>
        </div>

        {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
