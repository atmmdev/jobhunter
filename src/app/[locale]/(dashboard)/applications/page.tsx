import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ApplicationsPageClient } from '@/components/applications/applications-page-client';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createApplicationModule } from '@/modules/infrastructure/composition';
import { prisma } from '@/modules/infrastructure/prisma/client';
import type { ApplicationStatusValue } from '@/modules/domain/application/application.entity';
import { toApplicationListItemDto } from '@/shared/dto/application.dto';
import { listApplicationsQuerySchema } from '@/shared/schemas/application.schema';

/**
 * Applications approval queue and tracking page.
 */
export default async function ApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('applications');
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const raw = await searchParams;
  const query = listApplicationsQuerySchema.parse({
    status: typeof raw.status === 'string' ? raw.status : undefined,
    limit: 50,
    offset: 0,
  });

  const { listApplications } = createApplicationModule();
  const result = await listApplications.execute(session.user.id, query);

  const coverLetterIds = result.items
    .map((app) => app.coverLetterId)
    .filter((id): id is string => Boolean(id));

  const coverLetters =
    coverLetterIds.length > 0
      ? await prisma.coverLetter.findMany({
          where: { id: { in: coverLetterIds }, userId: session.user.id },
          select: { id: true, content: true },
        })
      : [];

  const contentById = new Map(coverLetters.map((letter) => [letter.id, letter.content]));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <ApplicationsPageClient
        applications={result.items.map((app) =>
          toApplicationListItemDto(app, {
            coverLetterContent: app.coverLetterId
              ? (contentById.get(app.coverLetterId) ?? null)
              : null,
          }),
        )}
        total={result.total}
        status={query.status as ApplicationStatusValue | undefined}
      />
    </div>
  );
}
