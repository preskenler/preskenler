'use client';

import { useTranslations } from 'next-intl';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { RequestCard } from '@/components/agents/request-card';
import { SessionStatus } from '@/components/agents/session-status';
import { useWebcupRequests } from '@/hooks/use-webcup-requests';
import type { WebcupSnapshot } from '@/lib/webcup/types';

export function RequestsBoard({
  initial,
  initialError,
}: {
  initial: WebcupSnapshot;
  initialError?: string | null;
}) {
  const t = useTranslations('Agents.requests');
  const { snapshot, hasError, isRefreshing } = useWebcupRequests(initial);
  const requests = snapshot.requests;
  const newCount = snapshot.newCodes.length;

  return (
    <div className="flex flex-col gap-6">
      {initialError || hasError ? (
        <Alert variant="destructive">
          <AlertTitle>{t('unavailableTitle')}</AlertTitle>
          <AlertDescription>
            {t('unavailableDescription', {
              message: initialError ?? t('refreshError'),
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      <SessionStatus session={snapshot.session} />

      <p className="sr-only" role="status" aria-live="polite">
        {t('status', { count: requests.length })}
        {newCount > 0 ? ` ${t('newStatus', { count: newCount })}` : ''}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-medium">
            {t('heading', { count: requests.length })}
          </h2>
          {newCount > 0 ? (
            <Badge>{t('newBadge', { count: newCount })}</Badge>
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground">
          {isRefreshing
            ? t('refreshing')
            : t('refreshedAt', {
                time: new Date(snapshot.fetchedAt).toLocaleTimeString('fr-FR'),
              })}
        </span>
      </div>

      {requests.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
            <RequestCard key={request.requestCode} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
