'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { WebcupRequestView } from '@/lib/webcup/types';

const NEW_WINDOW_MS = 15 * 60 * 1000;

function difficultyVariant(level: number) {
  switch (level) {
    case 4:
      return 'destructive' as const;
    case 3:
      return 'default' as const;
    case 2:
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
}

function isNew(request: WebcupRequestView) {
  return Date.now() - new Date(request.firstSeenAt).getTime() < NEW_WINDOW_MS;
}

export function RequestCard({ request }: { request: WebcupRequestView }) {
  const t = useTranslations('Agents.requests.card');

  const arrival = request.isInitial
    ? t('availableAtLaunch')
    : [
        t('wave', { number: request.waveNumber ?? '?' }),
        request.arrivalTime ? `H+${request.arrivalTime}` : null,
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {request.requestCode}
          </span>
          <Badge variant={difficultyVariant(request.difficultyLevel)}>
            {request.difficulty}
          </Badge>
          <Badge variant="outline">{t('xp', { xp: request.xpTotal })}</Badge>
          {isNew(request) ? <Badge>{t('new')}</Badge> : null}
        </CardTitle>
        <CardDescription>
          {request.requesterName} · {request.requesterType}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-pretty">{request.messagePublic}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{arrival}</span>
          <span>
            {t('xpBreakdown', {
              base: request.xpBase,
              bonus: request.xpTimeBonus,
            })}
          </span>
          {request.groupName ? <span>{request.groupName}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
