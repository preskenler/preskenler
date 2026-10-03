'use client';

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
  const { snapshot, error, isRefreshing } = useWebcupRequests(initial);
  const requests = snapshot.requests;

  return (
    <div className="flex flex-col gap-6">
      {initialError || error ? (
        <Alert variant="destructive">
          <AlertTitle>Flux indisponible</AlertTitle>
          <AlertDescription>
            {error ?? initialError} Les données affichées peuvent être
            incomplètes.
          </AlertDescription>
        </Alert>
      ) : null}

      <SessionStatus session={snapshot.session} />

      <p className="sr-only" role="status" aria-live="polite">
        {requests.length} demande{requests.length > 1 ? 's' : ''} suivie
        {requests.length > 1 ? 's' : ''}.
        {snapshot.newCodes.length > 0
          ? ` ${snapshot.newCodes.length} nouvelle(s).`
          : ''}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-medium">
            {requests.length} demande{requests.length > 1 ? 's' : ''} suivie
            {requests.length > 1 ? 's' : ''}
          </h2>
          {snapshot.newCodes.length > 0 ? (
            <Badge>{snapshot.newCodes.length} nouvelle(s)</Badge>
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground">
          {isRefreshing
            ? 'Actualisation…'
            : `Actualisé à ${new Date(snapshot.fetchedAt).toLocaleTimeString(
                'fr-FR',
              )}`}
        </span>
      </div>

      {requests.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Aucune demande pour le moment</EmptyTitle>
            <EmptyDescription>
              Le flux de Terra Nova n’a pas encore livré de demande.
            </EmptyDescription>
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
