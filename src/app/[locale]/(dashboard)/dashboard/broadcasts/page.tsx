import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  RiAlertLine,
  RiDeleteBinLine,
  RiEyeOffLine,
  RiRobot2Line,
} from '@remixicon/react';
import { getFormatter, getTranslations } from 'next-intl/server';

import { BroadcastForm } from '@/components/dashboard/broadcast-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { isBroadcastActive, type BroadcastRecord } from '@/lib/broadcasts';
import { getAllBroadcasts } from '@/lib/broadcast-store';
import { hasPermission } from '@/lib/permissions';
import {
  createBroadcast,
  deleteBroadcast,
  setBroadcastActive,
} from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard.broadcasts');

  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

function levelVariant(level: BroadcastRecord['level']) {
  if (level === 'alert') {
    return 'destructive' as const;
  }
  if (level === 'warning') {
    return 'secondary' as const;
  }
  return 'outline' as const;
}

export default async function BroadcastsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Dashboard.broadcasts');
  const format = await getFormatter();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  if (!hasPermission(session.user.role, { broadcast: ['list'] })) {
    return redirect({ href: '/dashboard', locale: locale as AppLocale });
  }

  const broadcasts = await getAllBroadcasts();
  const now = new Date();
  const active = broadcasts.filter((item) => isBroadcastActive(item, now));
  const past = broadcasts.filter((item) => !isBroadcastActive(item, now));

  function renderCard(item: BroadcastRecord) {
    return (
      <Card key={item.id} size="sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={levelVariant(item.level)}>
              {t(`levels.${item.level}`)}
            </Badge>
            <Badge variant="outline">{t(`topics.${item.topic}`)}</Badge>
            {item.isAi ? (
              <Badge variant="secondary">
                <RiRobot2Line aria-hidden="true" />
                {t('ai')}
              </Badge>
            ) : null}
            {!isBroadcastActive(item, now) ? (
              <Badge variant="outline">{t('inactive')}</Badge>
            ) : null}
          </div>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription>{item.body}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div>
              <dt className="inline">{t('audienceLabel')}: </dt>
              <dd className="inline">{t(`audiences.${item.audience}`)}</dd>
            </div>
            {item.area ? (
              <div>
                <dt className="inline">{t('areaLabel')}: </dt>
                <dd className="inline">{item.area}</dd>
              </div>
            ) : null}
            <div>
              <dt className="inline">{t('publishedLabel')}: </dt>
              <dd className="inline">
                {format.dateTime(item.publishedAt, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </dd>
            </div>
            {item.expiresAt ? (
              <div>
                <dt className="inline">{t('expiresLabel')}: </dt>
                <dd className="inline">
                  {format.dateTime(item.expiresAt, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            ) : null}
          </dl>

          {item.recommendations ? (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="mb-1 font-medium">{t('recommendationsTitle')}</p>
              <ul className="list-disc ps-5">
                {item.recommendations.split('\n').map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <form action={setBroadcastActive}>
              <input type="hidden" name="id" value={item.id} />
              <input
                type="hidden"
                name="active"
                value={item.active ? 'false' : 'true'}
              />
              <Button type="submit" size="sm" variant="outline">
                <RiEyeOffLine data-icon="inline-start" aria-hidden="true" />
                {item.active ? t('deactivate') : t('reactivate')}
              </Button>
            </form>
            <form action={deleteBroadcast}>
              <input type="hidden" name="id" value={item.id} />
              <Button type="submit" size="sm" variant="destructive">
                <RiDeleteBinLine data-icon="inline-start" aria-hidden="true" />
                {t('delete')}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t('description')}</p>

      <BroadcastForm action={createBroadcast} />

      <section className="flex flex-col gap-3">
        <h2 className="font-heading flex items-center gap-2 text-lg font-medium">
          <RiAlertLine aria-hidden="true" className="size-5" />
          {t('activeTitle')}
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          active.map(renderCard)
        )}
      </section>

      {past.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-medium">
            {t('inactiveTitle')}
          </h2>
          {past.map(renderCard)}
        </section>
      ) : null}
    </div>
  );
}
