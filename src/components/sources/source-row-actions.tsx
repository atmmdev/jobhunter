'use client';

import { PauseCircle, Play, Power } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { setSourceEnabledAction } from '@/app/actions/company.actions';
import { runSourceScrapeAction } from '@/app/actions/scrape.actions';
import { IconTooltipButton } from '@/components/ui/icon-tooltip-button';
import type { SourceListItemDto } from '@/shared/dto/source.dto';

const RUNNABLE_ATS = new Set([
  'GREENHOUSE',
  'LEVER',
  'ASHBY',
  'APINFO',
  'GUPY',
  'WORKDAY',
  'SMARTRECRUITERS',
  'BAMBOOHR',
  'TEAMTAILOR',
  'PERSONIO',
  'CUSTOM',
]);

interface SourceRowActionsProps {
  source: SourceListItemDto;
  onMessage: (message: string | null) => void;
  onError: (error: string | null) => void;
}

/**
 * Flat colored icon actions for a sources table row.
 */
export function SourceRowActions({ source, onMessage, onError }: SourceRowActionsProps) {
  const t = useTranslations('sources');
  const nextRouter = useNextRouter();
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const [toggling, setToggling] = useState(false);

  const canRun = source.enabled && source.atsType !== null && RUNNABLE_ATS.has(source.atsType);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <IconTooltipButton
        label={source.enabled ? t('disable') : t('enable')}
        icon={source.enabled ? PauseCircle : Power}
        tone={source.enabled ? 'disable' : 'enable'}
        disabled={pending || toggling}
        onClick={() =>
          startTransition(async () => {
            onError(null);
            onMessage(null);
            setToggling(true);
            const result = await setSourceEnabledAction({
              sourceId: source.id,
              enabled: !source.enabled,
            });
            setToggling(false);
            if (!result.ok) {
              onError(result.error);
              return;
            }
            nextRouter.refresh();
          })
        }
      />
      <IconTooltipButton
        label={running ? t('running') : t('run')}
        icon={Play}
        tone="run"
        disabled={!canRun || pending || running}
        onClick={() =>
          startTransition(async () => {
            onError(null);
            onMessage(null);
            setRunning(true);
            const result = await runSourceScrapeAction({ sourceId: source.id });
            setRunning(false);
            if (!result.ok) {
              onError(result.error);
              return;
            }
            onMessage(
              t('runResult', {
                adapter: result.data.adapterKey,
                found: result.data.jobsFound,
                created: result.data.jobsCreated,
                updated: result.data.jobsUpdated,
              }),
            );
            nextRouter.refresh();
          })
        }
      />
    </div>
  );
}
