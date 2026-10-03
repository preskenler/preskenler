import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

// TODO(copy): placeholder copy until the product is announced.
export default async function NotFound() {
  const t = await getTranslations('Errors.NotFound');

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="font-mono text-sm font-medium text-muted-foreground">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-md text-pretty text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/" />}>
        {t('backHome')}
      </Button>
    </main>
  );
}
