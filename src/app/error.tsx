'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

// TODO(copy): placeholder copy until the product is announced.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // TODO(monitoring): forward the error to an error reporting service.
    logger.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="font-mono text-sm font-medium text-muted-foreground">
        Erreur
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Une erreur est survenue
        </h1>
        <p className="mx-auto max-w-md text-pretty text-muted-foreground">
          Quelque chose s’est mal passé. Réessaie dans un instant.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => retry()}>Réessayer</Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Retour à l’accueil
        </Button>
      </div>
    </main>
  );
}
