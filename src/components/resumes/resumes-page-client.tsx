'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { deleteResumeAction } from '@/app/actions/resume.actions';
import { CreateResumeForm } from '@/components/resumes/create-resume-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumeListItemDto } from '@/shared/dto/resume.dto';

interface ResumesPageClientProps {
  resumes: ResumeListItemDto[];
}

/**
 * Client shell for resume list and create form.
 */
export function ResumesPageClient({ resumes }: ResumesPageClientProps) {
  const t = useTranslations('resumes');
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setShowForm((value) => !value)}>
          {t('add')}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('add')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateResumeForm
              onCancel={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
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
                  <CardDescription>{t(`stack.${resume.stack}`)}</CardDescription>
                </div>
                <Badge variant={resume.isActive ? 'success' : 'secondary'}>
                  {resume.isActive ? t('active') : t('inactive')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume.summary ? (
                  <p className="text-sm text-muted-foreground">{resume.summary}</p>
                ) : null}
                <p className="line-clamp-4 whitespace-pre-wrap text-sm">{resume.contentText}</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
