import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { StaffShell } from '@/components/staff/staff-shell';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export default async function AgentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/sign-in');
  }

  const canView =
    hasPermission(session.user.role, { webcupRequest: ['list'] }) ||
    hasPermission(session.user.role, { serviceMessage: ['list'] });

  if (!canView) {
    redirect('/account');
  }

  return (
    <StaffShell session={session} area="agents">
      {children}
    </StaffShell>
  );
}
