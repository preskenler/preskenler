import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { RiAddLine } from '@remixicon/react';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Link, redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { type ProblemReportView, type ProblemStatus } from '@/lib/reports';
import {
  getStaffProblemReports,
  getUserProblemReports,
} from '@/lib/report-store';
import { setReportStatus } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard.reports');

  return { title: t('title') };
}

export const dynamic = 'force-dynamic';

function statusVariant(status: ProblemStatus) {
  if (status === 'resolved') {
    return 'outline' as const;
  }
  if (status === 'in_progress') {
    return 'secondary' as const;
  }
  return 'default' as const;
}

const statusActions: { status: ProblemStatus; label: string }[] = [
  { status: 'in_progress', label: 'markInProgress' },
  { status: 'resolved', label: 'markResolved' },
  { status: 'new', label: 'reopen' },
];

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Dashboard.reports');
  const tCategories = await getTranslations('Public.Reports.categories');
  const tStatuses = await getTranslations('Public.Reports.statuses');
  const format = await getFormatter();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  const isStaff = hasPermission(session.user.role, {
    problemReport: ['list'],
  });
  const reports: (ProblemReportView & { name?: string; email?: string })[] =
    isStaff
      ? await getStaffProblemReports()
      : await getUserProblemReports(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('description')}
        </p>
        {!isStaff ? (
          <Button nativeButton={false} render={<Link href="/reports" />}>
            <RiAddLine data-icon="inline-start" aria-hidden="true" />
            {t('newReport')}
          </Button>
        ) : null}
      </div>

      {isStaff ? (
        <p className="text-sm text-muted-foreground">
          {t('summary', {
            pending: reports.filter((report) => report.status === 'new').length,
            total: reports.length,
          })}
        </p>
      ) : null}

      {reports.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{isStaff ? t('empty') : t('emptyMine')}</EmptyTitle>
            <EmptyDescription>{t('description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={statusVariant(report.status)}>
                    {tStatuses(report.status)}
                  </Badge>
                  <Badge variant="outline">
                    {tCategories(report.category)}
                  </Badge>
                  <span className="font-medium">
                    {t('reference', { reference: report.reference })}
                  </span>
                </div>
                <CardTitle>{report.location}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  {t('createdAt', {
                    date: format.dateTime(new Date(report.createdAt), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }),
                  })}
                </p>

                {report.email ? (
                  <p className="text-xs text-muted-foreground">
                    {report.name} · {report.email}
                  </p>
                ) : null}

                {isStaff ? (
                  <div className="flex flex-wrap gap-2">
                    {statusActions
                      .filter((action) => action.status !== report.status)
                      .map((action) => (
                        <form key={action.status} action={setReportStatus}>
                          <input type="hidden" name="id" value={report.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={action.status}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant={
                              action.status === 'resolved'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {t(action.label)}
                          </Button>
                        </form>
                      ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
