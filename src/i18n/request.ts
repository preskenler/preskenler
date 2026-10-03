import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

/**
 * Request-scoped configuration for Server Components, Server Actions, metadata
 * and friends.
 *
 * We read the locale from the `requestLocale` promise (populated by the proxy
 * from the matched `[locale]` segment) rather than `next/root-params`, because
 * `next/root-params` is not available inside Server Actions — and the contact
 * form validates and translates inside one.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    timeZone: 'Europe/Paris',
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
