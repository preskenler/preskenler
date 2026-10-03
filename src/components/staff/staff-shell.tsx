import type { ReactNode } from 'react';
import Link from 'next/link';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { StaffNav } from '@/components/staff/staff-nav';
import { Button } from '@/components/ui/button';
import type { Session } from '@/lib/auth';
import { normalizeRole, roleLabels } from '@/lib/roles';

export function StaffShell({
  session,
  area,
  children,
}: {
  session: Session;
  area: 'agents' | 'admin';
  children: ReactNode;
}) {
  const role = normalizeRole(session.user.role);
  const isAdminArea = area === 'admin';

  return (
    <main
      id="contenu"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold">
              {isAdminArea
                ? 'Administration — Terra Nova'
                : 'Espace agents — Terra Nova'}
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

        <StaffNav
          role={session.user.role}
          label={
            isAdminArea
              ? 'Navigation de l’administration'
              : 'Navigation de l’espace agents'
          }
        />
      </div>

      {children}
    </main>
  );
}
