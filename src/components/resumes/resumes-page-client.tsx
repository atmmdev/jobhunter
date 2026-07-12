'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { deleteResumeAction } from '@/app/actions/resume.actions';
import { ResumeForm } from '@/components/resumes/resume-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumeListItemDto } from '@/shared/dto/resume.dto';

interface ResumesPageClientProps {
  resumes: ResumeListItemDto[];
}

/**
 * Client shell for resume list, create and edit.
 */
export function ResumesPageClient({ resumes }: ResumesPageClientProps) {
  const t = useTranslations('resumes');
  const router = useRouter();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing] = useState<ResumeListItemDto | null>(null);
  const [pending, startTransition] = useTransition();

  const closeForm = () => {
    setMode('list');
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setMode((current) => (current === 'create' ? 'list' : 'create'));
          }}
        >
          {t('add')}
        </Button>
      </div>

      {mode === 'create' ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('add')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeForm
              onCancel={closeForm}
              onSuccess={() => {
                closeForm();
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {mode === 'edit' && editing ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('edit')}</CardTitle>
            <CardDescription>
              {editing.name} · {t(`locale.${editing.locale}`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeForm
              initial={editing}
              onCancel={closeForm}
              onSuccess={() => {
                closeForm();
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {resumes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="space-y-1">
                  <CardTitle>{resume.name}</CardTitle>
                  <CardDescription>
                    {t(`stack.${resume.stack}`)} · {t(`locale.${resume.locale}`)}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={resume.isActive ? 'success' : 'secondary'}>
                    {resume.isActive ? t('active') : t('inactive')}
                  </Badge>
                  <Badge variant="outline">{t(`locale.${resume.locale}`)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume.summary ? (
                  <p className="text-sm text-muted-foreground">{resume.summary}</p>
                ) : null}
                <p className="line-clamp-4 whitespace-pre-wrap text-sm">{resume.contentText}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      setEditing(resume);
                      setMode('edit');
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm(t('form.deleteConfirm'))) {
                        return;
                      }
                      startTransition(async () => {
                        await deleteResumeAction({ id: resume.id });
                        router.refresh();
                      });
                    }}
                  >
                    {t('delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
