import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ResumesPageClient } from '@/components/resumes/resumes-page-client';
import { createResumeModule } from '@/modules/infrastructure/composition';
import { auth } from '@/modules/infrastructure/auth/auth';
import { toResumeListItemDto } from '@/shared/dto/resume.dto';

/**
 * Resumes management page — list and create stack-specific variants.
 */
export default async function ResumesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('resumes');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { listResumes } = createResumeModule();
  const resumes = await listResumes.execute(session.user.id);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <ResumesPageClient resumes={resumes.map(toResumeListItemDto)} />
    </div>
  );
}
