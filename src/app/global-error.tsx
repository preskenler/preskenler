'use client';

import '@/app/globals.css';
import { useEffect, useSyncExternalStore } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';

import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import { routing, type AppLocale } from '@/i18n/routing';

// `global-error` replaces the root layout, so it renders its own html/body and
// cannot read the `[locale]` segment. Read the locale from the `NEXT_LOCALE`
// cookie the proxy sets, falling back to the default locale on the server.
// TODO(copy): placeholder copy until the product is announced.
const catalogs = { fr, en } as const;

function getLocaleSnapshot(): AppLocale {
  if (typeof document === 'undefined') {
    return routing.defaultLocale;
  }

  const match = new RegExp(
    `(?:^|;\\s*)NEXT_LOCALE=(${routing.locales.join('|')})`,
  ).exec(document.cookie);

  return (match?.[1] as AppLocale) ?? routing.defaultLocale;
}

function subscribe() {
  return () => {};
}

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    () => routing.defaultLocale,
  );

  useEffect(() => {
    // TODO(monitoring): forward the error to an error reporting service.
  }, [error]);

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-16 text-center antialiased">
        <NextIntlClientProvider locale={locale} messages={catalogs[locale]}>
          <GlobalErrorContent retry={retry} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function GlobalErrorContent({ retry }: { retry: () => void }) {
  const t = useTranslations('Errors.Error');

  return (
    <>
      <p className="font-mono text-sm font-medium text-muted-foreground">
        {t('label')}
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-md text-pretty text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <button
        type="button"
        onClick={() => retry()}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        {t('retry')}
      </button>
    </>
  );
}
