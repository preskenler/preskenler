import type { ReactNode } from 'react';
import { headers } from 'next/headers';

import { SiteHeader } from '@/components/site/site-header';
import { auth } from '@/lib/auth';

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader session={session} />
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} PreskEnLer · Portail de la Ville de Terra
          Nova
        </div>
      </footer>
    </div>
  );
}
