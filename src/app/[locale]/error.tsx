'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

// TODO(copy): placeholder copy until the product is announced.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations('Errors.Error');

  useEffect(() => {
    // TODO(monitoring): forward the error to an error reporting service.
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="font-mono text-sm font-medium text-muted-foreground">
        {t('label')}
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-md text-pretty text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => retry()}>{t('retry')}</Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          {t('backHome')}
        </Button>
      </div>
    </main>
  );
}
