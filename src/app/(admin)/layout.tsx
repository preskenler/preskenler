import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { StaffShell } from '@/components/staff/staff-shell';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/sign-in');
  }

  if (!hasPermission(session.user.role, { user: ['list'] })) {
    // Agents land in their workspace; citizens in their account.
    redirect(
      hasPermission(session.user.role, { webcupRequest: ['list'] })
        ? '/agents/requests'
        : '/account',
    );
  }

  return (
    <StaffShell session={session} area="admin">
      {children}
    </StaffShell>
  );
}
