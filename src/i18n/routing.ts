import { defineRouting } from 'next-intl/routing';

/**
 * Locale routing configuration.
 *
 * `fr` is the default and stays unprefixed (`/services`), while English lives
 * under `/en/services`. `as-needed` keeps every existing French URL and auth
 * callback (e.g. `/reset-password`) valid.
 */
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];
