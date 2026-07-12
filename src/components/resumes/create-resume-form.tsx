'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createResumeAction } from '@/app/actions/resume.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createResumeSchema, type CreateResumeDto } from '@/shared/schemas/resume.schema';

interface CreateResumeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Form for creating a stack-specific resume variant.
 */
export function CreateResumeForm({ onSuccess, onCancel }: CreateResumeFormProps) {
  const t = useTranslations('resumes');
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateResumeDto>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      name: '',
      stack: 'JS_TS',
      summary: '',
      contentText: '',
      isActive: true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const result = await createResumeAction(values);
    if (!result.ok) {
      setError(result.error || t('form.error'));
      return;
    }
    form.reset();
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
          <Textarea id="contentText" className="min-h-[180px]" {...form.register('contentText')} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input id="isActive" type="checkbox" className="h-4 w-4" {...form.register('isActive')} />
          <Label htmlFor="isActive">{t('form.isActive')}</Label>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t('form.submit')}
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
