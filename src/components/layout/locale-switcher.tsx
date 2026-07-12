'use client';

import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from '@/shared/i18n/navigation';

/**
 * Switches UI locale between English and Portuguese.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === 'en' ? 'pt-BR' : 'en';

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
    >
      {nextLocale === 'en' ? 'EN' : 'PT'}
    </Button>
  );
}
