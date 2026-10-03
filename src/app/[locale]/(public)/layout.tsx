import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { BroadcastBanner } from '@/components/public/broadcast-banner';
import { PublicBreadcrumbs } from '@/components/public/public-breadcrumbs';
import { PublicHeader } from '@/components/public/public-header';
import { auth } from '@/lib/auth';
import { toBroadcastView } from '@/lib/broadcasts';
import { getActiveBroadcasts } from '@/lib/broadcast-store';

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const t = await getTranslations('Public.Footer');
  const broadcasts = (await getActiveBroadcasts()).map(toBroadcastView);

  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader session={session} />
      <BroadcastBanner items={broadcasts} />
      <PublicBreadcrumbs />
      <main id="contenu" className="flex flex-1 flex-col">
        {children}
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-muted-foreground">
          {t('copyright', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
}
