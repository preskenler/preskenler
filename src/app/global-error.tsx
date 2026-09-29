'use client';

import '@/app/globals.css';
import { useEffect } from 'react';

// global-error replaces the root layout, so it must render its own html/body.
// TODO(copy): placeholder copy until the product is announced.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // TODO(monitoring): forward the error to an error reporting service.
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-16 text-center antialiased">
        <p className="font-mono text-sm font-medium text-muted-foreground">
          Erreur
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            Une erreur est survenue
          </h1>
          <p className="mx-auto max-w-md text-pretty text-muted-foreground">
            Quelque chose s’est mal passé. Réessaie dans un instant.
          </p>
        </div>
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
