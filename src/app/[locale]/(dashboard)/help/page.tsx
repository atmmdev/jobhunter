import { setRequestLocale } from 'next-intl/server';

import { HelpPageContent } from '@/components/help/help-page-content';

/**
 * In-app help / tutorial describing how Job Hunter AI works.
 */
export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HelpPageContent />;
}
