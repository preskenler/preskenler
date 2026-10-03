import type { Metadata } from 'next';
import { RiAlertLine, RiRobot2Line } from '@remixicon/react';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toBroadcastView, type BroadcastRecord } from '@/lib/broadcasts';
import { getActiveBroadcasts } from '@/lib/broadcast-store';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Alerts');

  return {
    title: t('metaTitle'),
  };
}

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
  const t = await getTranslations('Public.Alerts');
  const format = await getFormatter();
  const broadcasts = await getActiveBroadcasts();
  const views = broadcasts.map(toBroadcastView);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          {t('description')}
        </p>
      </header>

      {views.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        views.map((view, index) => {
          const record = broadcasts[index] as BroadcastRecord;
          return (
            <Alert
              key={view.id}
              variant={view.level === 'info' ? 'default' : 'destructive'}
            >
              <RiAlertLine aria-hidden="true" />
              <AlertTitle>{view.title}</AlertTitle>
              <AlertDescription>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{t(`levels.${view.level}`)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format.dateTime(record.publishedAt, {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </span>
                  {view.area ? (
                    <span className="text-xs font-medium">
                      {t('area', { area: view.area })}
                    </span>
                  ) : null}
                </div>
                <p className="text-pretty">{view.body}</p>
                {view.recommendations.length > 0 ? (
                  <>
                    <p className="mt-3 font-medium">{t('recommendations')}</p>
                    <ul className="list-disc ps-5">
                      {view.recommendations.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {view.isAi ? (
                  <p className="mt-3 flex items-center gap-1 text-xs">
                    <RiRobot2Line aria-hidden="true" className="size-3.5" />
                    {t('ai')}
                  </p>
                ) : null}
              </AlertDescription>
            </Alert>
          );
        })
      )}
    </div>
  );
}
