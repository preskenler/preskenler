import type { ReactNode } from 'react';
import { headers } from 'next/headers';

import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
