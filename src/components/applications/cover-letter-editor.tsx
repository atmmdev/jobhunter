'use client';

import { RefreshCw, Save, X } from 'lucide-react';
import { useRouter } from '@/shared/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';

import {
  generateCoverLetterAction,
  updateCoverLetterAction,
} from '@/app/actions/cover-letter.actions';
import { IconTooltipButton } from '@/components/ui/icon-tooltip-button';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';

interface CoverLetterEditorProps {
  applicationId: string;
  coverLetterId: string | null;
  initialContent: string | null;
  onClose: () => void;
}

/**
 * Inline cover letter generator and editor for an application.
 */
export function CoverLetterEditor({
  applicationId,
  coverLetterId,
  initialContent,
  onClose,
}: CoverLetterEditorProps) {
  const t = useTranslations('applications.coverLetter');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState(initialContent ?? '');
  const [letterId, setLetterId] = useState<string | null>(coverLetterId);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent ?? '');
    setLetterId(coverLetterId);
  }, [applicationId, coverLetterId, initialContent]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{t('title')}</p>
          <IconTooltipButton label={t('close')} icon={X} tone="close" onClick={onClose} />
        </div>

        {message ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={12}
          placeholder={t('placeholder')}
          disabled={pending}
        />

        <div className="flex flex-wrap items-center gap-1">
          <IconTooltipButton
            label={letterId ? t('regenerate') : t('generate')}
            icon={RefreshCw}
            tone="generate"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                setMessage(null);
                const result = await generateCoverLetterAction({ applicationId });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setContent(result.data.content);
                setLetterId(result.data.id);
                setMessage(result.data.usedAi ? t('generatedAi') : t('generatedTemplate'));
                router.refresh();
              })
            }
          />
          <IconTooltipButton
            label={t('save')}
            icon={Save}
            tone="save"
            disabled={pending || !letterId || content.trim().length < 50}
            onClick={() =>
              startTransition(async () => {
                if (!letterId) {
                  return;
                }
                setError(null);
                setMessage(null);
                const result = await updateCoverLetterAction({
                  coverLetterId: letterId,
                  content,
                });
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setMessage(t('saved'));
                router.refresh();
              })
            }
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
