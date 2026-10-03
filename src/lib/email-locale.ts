import { routing, type AppLocale } from '@/i18n/routing';

/** Cookie set by the next-intl proxy on every localized response. */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Resolve the locale for an auth email from the incoming request.
 *
 * Better Auth passes the original `Request` as the second argument to the
 * email callbacks. `/api/auth/*` is excluded from the i18n matcher, so there is
 * no request locale; we fall back to the `NEXT_LOCALE` cookie the middleware
 * sets for the browser, then `Accept-Language`, then the default locale.
 */
export function resolveEmailLocale(request?: Request | null): AppLocale {
  const cookie = request?.headers.get('cookie') ?? '';
  const cookieMatch = new RegExp(
    `(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]+)`,
  ).exec(cookie);
  const cookieLocale = cookieMatch?.[1]?.trim();

  if (
    cookieLocale &&
    (routing.locales as readonly string[]).includes(cookieLocale)
  ) {
    return cookieLocale as AppLocale;
  }

  const acceptLanguage = request?.headers.get('accept-language') ?? '';

  if (/(^|,)\s*en\b/i.test(acceptLanguage)) {
    return 'en';
  }

  return routing.defaultLocale;
}
