import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

/**
 * Locale negotiation for page requests. Next.js 16 renamed middleware to proxy.
 *
 * `/api/*` (Better Auth + the Webcup cron) is deliberately excluded so those
 * routes stay non-localized.
 */
export default createMiddleware(routing);

export const config = {
  // Skip:
  // - API routes, tRPC, Next internals and Vercel endpoints
  // - files with an extension (e.g. favicon.ico, sitemap.xml)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
