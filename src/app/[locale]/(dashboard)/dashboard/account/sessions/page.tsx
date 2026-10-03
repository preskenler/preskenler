import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { SessionList } from '@/components/auth/session-list';
import { auth } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account');

  return { title: t('sessions.metaTitle') };
}

export default async function SessionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const sessions = await auth.api.listSessions({ headers: await headers() });

  return <SessionList sessions={sessions ?? []} />;
}
