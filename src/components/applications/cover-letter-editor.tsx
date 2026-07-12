'use client';

import { useRouter } from '@/shared/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';

import {
  generateCoverLetterAction,
  updateCoverLetterAction,
} from '@/app/actions/cover-letter.actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{t('title')}</p>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          {t('close')}
        </Button>
      </div>

      {message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={12}
        placeholder={t('placeholder')}
        disabled={pending}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
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
        >
          {letterId ? t('regenerate') : t('generate')}
        </Button>
        <Button
          type="button"
          size="sm"
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
        >
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
