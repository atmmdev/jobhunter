import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/modules/infrastructure/auth/auth';

/**
 * Account settings: locale, theme, sign out.
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('settings');
  const session = await auth();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{session?.user?.email ?? '—'}</CardTitle>
          <CardDescription>{session?.user?.name ?? session?.user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('language')}</span>
            <LocaleSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('theme')}</span>
            <ThemeToggle />
          </div>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
