import { getRequestConfig } from 'next-intl/server';

import { routing } from '@/shared/i18n/routing';

/**
 * Loads locale messages for the active request.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'en' | 'pt-BR')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
