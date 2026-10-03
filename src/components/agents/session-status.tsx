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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          État du flux
          {session ? (
            <Badge variant={session.isRunning ? 'default' : 'secondary'}>
              {session.isRunning ? 'En cours' : session.status}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Vague actuelle" value={session.currentWave} />
            <Stat
              label="Demandes visibles"
              value={session.visibleRequestsCount}
            />
            <Stat
              label="Initiales / vagues"
              value={`${session.initialRequestsCount} / ${session.waveRequestsCount}`}
            />
            <Stat
              label="Prochaine vague"
              value={
                session.nextWaveNumber === 0
                  ? 'Toutes diffusées'
                  : `n°${session.nextWaveNumber} · ${session.minutesUntilNextWave} min`
              }
            />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune donnée de session pour le moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
