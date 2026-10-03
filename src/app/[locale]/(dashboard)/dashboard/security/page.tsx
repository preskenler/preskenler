import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { getSecurityOverview } from '@/lib/auth-audit';
import { hasPermission } from '@/lib/permissions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard.security');

  return { title: t('title') };
}

export const dynamic = 'force-dynamic';

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Dashboard.security');
  const format = await getFormatter();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  if (!hasPermission(session.user.role, { auditLog: ['list'] })) {
    return redirect({ href: '/dashboard', locale: locale as AppLocale });
  }

  const overview = await getSecurityOverview(24);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('description')}
        </p>
        <Badge variant="outline">
          {t('hours', { hours: overview.windowHours })}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        {t('summary', {
          total: overview.totalAttempts,
          failures: overview.failures,
        })}
      </p>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('accountsTitle')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {overview.accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('accountsEmpty')}
              </p>
            ) : (
              overview.accounts.map((account) => (
                <div
                  key={account.email}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{account.email}</span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="destructive">
                      {t('failures', { count: account.failures })}
                    </Badge>
                    {format.dateTime(new Date(account.lastAt), {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('addressesTitle')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {overview.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('addressesEmpty')}
              </p>
            ) : (
              overview.addresses.map((address) => (
                <div
                  key={address.ipAddress}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{address.ipAddress}</span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="destructive">
                      {t('failures', { count: address.failures })}
                    </Badge>
                    <Badge variant="outline">
                      {t('accounts', { count: address.accounts })}
                    </Badge>
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">{t('recentTitle')}</h2>
        {overview.recent.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t('recentEmpty')}</EmptyTitle>
              <EmptyDescription>{t('description')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">{t('account')}</th>
                    <th className="px-4 py-2 font-medium">{t('address')}</th>
                    <th className="px-4 py-2 font-medium">{t('result')}</th>
                    <th className="px-4 py-2 font-medium">{t('when')}</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{entry.email}</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {entry.ipAddress ?? '—'}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={
                            entry.outcome === 'success'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {t(`outcome.${entry.outcome}`)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {format.dateTime(new Date(entry.createdAt), {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
