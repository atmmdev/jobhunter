import { redirect } from '@/shared/i18n/navigation';

/**
 * Locale root redirects into the dashboard (auth middleware may send to login).
 */
export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/dashboard', locale });
}
