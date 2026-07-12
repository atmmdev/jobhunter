'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createJobAction } from '@/app/actions/job.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createJobSchema, type CreateJobDto } from '@/shared/schemas/job.schema';

interface CreateJobFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Form for manually creating a job opportunity.
 */
export function CreateJobForm({ onSuccess, onCancel }: CreateJobFormProps) {
  const t = useTranslations('jobs.form');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<CreateJobDto>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      descriptionText: '',
      applyUrl: '',
      companyName: '',
      location: '',
      country: '',
      isRemote: false,
      employmentType: '',
      seniority: '',
      salaryRaw: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(false);
    const result = await createJobAction(values);
    if (!result.ok) {
      setError(result.error || t('error'));
      return;
    }
    setSuccess(true);
    form.reset();
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">{t('title')}</Label>
          <Input id="title" {...form.register('title')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">{t('companyName')}</Label>
          <Input id="companyName" {...form.register('companyName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applyUrl">{t('applyUrl')}</Label>
          <Input id="applyUrl" type="url" {...form.register('applyUrl')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{t('location')}</Label>
          <Input id="location" {...form.register('location')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">{t('country')}</Label>
          <Input id="country" {...form.register('country')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employmentType">{t('employmentType')}</Label>
          <Input id="employmentType" {...form.register('employmentType')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seniority">{t('seniority')}</Label>
          <Input id="seniority" {...form.register('seniority')} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="salaryRaw">{t('salaryRaw')}</Label>
          <Input id="salaryRaw" {...form.register('salaryRaw')} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input id="isRemote" type="checkbox" className="h-4 w-4" {...form.register('isRemote')} />
          <Label htmlFor="isRemote">{t('isRemote')}</Label>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descriptionText">{t('description')}</Label>
          <Textarea id="descriptionText" {...form.register('descriptionText')} />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{t('success')}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t('submit')}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
