'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WebcupSessionView } from '@/lib/webcup/types';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-heading text-lg font-medium">{value}</dd>
    </div>
  );
}

export function SessionStatus({
  session,
}: {
  session: WebcupSessionView | null;
}) {
  const t = useTranslations('Agents.session');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {t('title')}
          {session ? (
            <Badge variant={session.isRunning ? 'default' : 'secondary'}>
              {session.isRunning ? t('running') : session.status}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label={t('currentWave')} value={session.currentWave} />
            <Stat
              label={t('visibleRequests')}
              value={session.visibleRequestsCount}
            />
            <Stat
              label={t('initialAndWaves')}
              value={`${session.initialRequestsCount} / ${session.waveRequestsCount}`}
            />
            <Stat
              label={t('nextWave')}
              value={
                session.nextWaveNumber === 0
                  ? t('allBroadcast')
                  : t('nextWaveValue', {
                      number: session.nextWaveNumber,
                      minutes: session.minutesUntilNextWave,
                    })
              }
            />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
