'use client';

import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

/**
 * Signs the current user out and returns to login.
 */
export function SignOutButton() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
    >
      {t('signOut')}
    </Button>
  );
}
