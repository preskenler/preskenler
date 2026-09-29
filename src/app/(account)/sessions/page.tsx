import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { SessionList } from '@/components/auth/session-list';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Sessions actives — PreskEnLer',
};

export default async function SessionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const sessions = await auth.api.listSessions({ headers: await headers() });

  return <SessionList sessions={sessions ?? []} />;
}
