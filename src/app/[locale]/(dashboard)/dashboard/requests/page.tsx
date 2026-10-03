import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { RequestsBoard } from '@/components/agents/requests-board';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { readWebcupSnapshot, syncWebcup } from '@/lib/webcup/sync';
import type { WebcupSnapshot } from '@/lib/webcup/types';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Agents.requests');

  return { title: t('metaTitle') };
}

// Always render from the live feed, never from a cached render.
export const dynamic = 'force-dynamic';

export default async function RequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Agents.requests');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  if (!hasPermission(session.user.role, { webcupRequest: ['list'] })) {
    return redirect({ href: '/dashboard', locale: locale as AppLocale });
  }

  let snapshot: WebcupSnapshot;
  let error: string | null = null;

  try {
    snapshot = await syncWebcup();
  } catch (syncError) {
    console.error('[webcup] initial sync failed', syncError);
    error = t('syncError');
    snapshot = await readWebcupSnapshot();
  }

  return <RequestsBoard initial={snapshot} initialError={error} />;
}
