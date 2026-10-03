import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { CitizenNav } from '@/components/citizen/citizen-nav';
import { auth } from '@/lib/auth';

export default async function CitizenLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Mon compte</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <CitizenNav />
      </div>
      {children}
    </main>
  );
}
