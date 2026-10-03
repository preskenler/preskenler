import type { ReactNode } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { normalizeRole, roleLabels } from '@/lib/roles';

export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/sign-in');
  }

  // Citizens never reach the agent workspace.
  if (!hasPermission(session.user.role, { webcupRequest: ['list'] })) {
    redirect('/account');
  }

  const role = normalizeRole(session.user.role);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold">
              Espace agents — Terra Nova
            </h1>
            <p className="text-sm text-muted-foreground">
              {session.user.email} · {roleLabels[role]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Portail
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/account" />}
            >
              Mon compte
            </Button>
            <SignOutButton />
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/requests"
            className="rounded-md px-2.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Demandes
          </Link>
          <Link
            href="/messages"
            className="rounded-md px-2.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Messages
          </Link>
          {hasPermission(role, { user: ['list'] }) ? (
            <Link
              href="/users"
              className="rounded-md px-2.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Utilisateurs
            </Link>
          ) : null}
        </nav>
      </div>

      {children}
    </main>
  );
}
