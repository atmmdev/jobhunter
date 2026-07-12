'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createResumeAction, updateResumeAction } from '@/app/actions/resume.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ResumeListItemDto } from '@/shared/dto/resume.dto';
import {
  createResumeSchema,
  updateResumeSchema,
  type CreateResumeDto,
  type UpdateResumeDto,
} from '@/shared/schemas/resume.schema';

interface ResumeFormProps {
  initial?: ResumeListItemDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type ResumeFormValues = CreateResumeDto;

/**
 * Shared create/edit form for resume variants (includes locale).
 */
export function ResumeForm({ initial, onSuccess, onCancel }: ResumeFormProps) {
  const t = useTranslations('resumes');
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial);

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      name: initial?.name ?? '',
      stack: initial?.stack ?? 'JS_TS',
      locale: initial?.locale ?? 'en',
      summary: initial?.summary ?? '',
      contentText: initial?.contentText ?? '',
      isActive: initial?.isActive ?? true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (isEdit && initial) {
      const payload: UpdateResumeDto = { id: initial.id, ...values };
      const parsed = updateResumeSchema.safeParse(payload);
      if (!parsed.success) {
        setError(t('form.error'));
        return;
      }
      const result = await updateResumeAction(parsed.data);
      if (!result.ok) {
        setError(result.error || t('form.updateError'));
        return;
      }
      onSuccess?.();
      return;
    }

    const result = await createResumeAction(values);
    if (!result.ok) {
      setError(result.error || t('form.error'));
      return;
    }
    form.reset({
      name: '',
      stack: 'JS_TS',
      locale: 'en',
      summary: '',
      contentText: '',
      isActive: true,
    });
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t('form.name')}</Label>
          <Input id="name" {...form.register('name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale">{t('form.locale')}</Label>
          <Select id="locale" {...form.register('locale')}>
            <option value="en">{t('locale.en')}</option>
            <option value="pt-BR">{t('locale.pt-BR')}</option>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="stack">{t('form.stack')}</Label>
          <Select id="stack" {...form.register('stack')}>
            <option value="JS_TS">{t('stack.JS_TS')}</option>
            <option value="DOTNET">{t('stack.DOTNET')}</option>
            <option value="PHP">{t('stack.PHP')}</option>
            <option value="OTHER">{t('stack.OTHER')}</option>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">{t('form.summary')}</Label>
          <Textarea id="summary" {...form.register('summary')} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contentText">{t('form.content')}</Label>
          <Textarea id="contentText" className="min-h-[220px]" {...form.register('contentText')} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input id="isActive" type="checkbox" className="h-4 w-4" {...form.register('isActive')} />
          <Label htmlFor="isActive">{t('form.isActive')}</Label>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {isEdit ? t('form.save') : t('form.submit')}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('form.cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
