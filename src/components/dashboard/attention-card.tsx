import {
  RiAlertLine,
  RiMailLine,
  RiCheckboxCircleLine,
} from '@remixicon/react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import type { BroadcastView } from '@/lib/broadcasts';

/**
 * Citizen "needs attention" summary (demande F32): surfaces the few things that
 * require an action — pending messages and active alerts — instead of making
 * residents scan every screen.
 */
export async function AttentionCard({
  pendingMessages,
  alerts,
}: {
  pendingMessages: number;
  alerts: BroadcastView[];
}) {
  const t = await getTranslations('Dashboard.attention');
  const hasItems = pendingMessages > 0 || alerts.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasItems ? (
          <ul className="flex flex-col gap-3">
            {alerts.length > 0 ? (
              <li className="flex items-start gap-3">
                <RiAlertLine
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-destructive"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {t('alerts', { count: alerts.length })}
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto w-fit p-0"
                    nativeButton={false}
                    render={<Link href="/alerts" />}
                  >
                    {t('viewAlerts')}
                  </Button>
                </div>
              </li>
            ) : null}

            {pendingMessages > 0 ? (
              <li className="flex items-start gap-3">
                <RiMailLine
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {t('pending', { count: pendingMessages })}
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto w-fit p-0"
                    nativeButton={false}
                    render={<Link href="/dashboard/inbox" />}
                  >
                    {t('viewMessages')}
                  </Button>
                </div>
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <RiCheckboxCircleLine
              aria-hidden="true"
              className="size-4 text-primary"
            />
            {t('none')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
