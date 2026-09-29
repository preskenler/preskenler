'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MonitorIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';

export type SessionInfo = {
  id: string;
  token: string;
  createdAt: string | Date;
  userAgent?: string | null;
  ipAddress?: string | null;
};

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function SessionList({ sessions }: { sessions: SessionInfo[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  async function revoke(token: string) {
    setPendingToken(token);
    const { error: revokeError } = await authClient.revokeSession({ token });
    setPendingToken(null);

    if (revokeError) {
      setError(revokeError.message ?? 'Impossible de révoquer cette session.');
      return;
    }

    setError(null);
    router.refresh();
  }

  async function revokeOtherSessions() {
    setRevokingOthers(true);
    const { error: revokeError } = await authClient.revokeOtherSessions();
    setRevokingOthers(false);

    if (revokeError) {
      setError(
        revokeError.message ?? 'Impossible de déconnecter les autres sessions.',
      );
      return;
    }

    setError(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions actives</CardTitle>
        <CardDescription>
          Appareils actuellement connectés à ton compte.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune session active.
          </p>
        ) : (
          <ItemGroup>
            {sessions.map((session) => (
              <Item key={session.id} variant="outline">
                <ItemMedia variant="icon">
                  <MonitorIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {session.userAgent || 'Appareil inconnu'}
                  </ItemTitle>
                  <ItemDescription>
                    {session.ipAddress ? `${session.ipAddress} · ` : ''}
                    {formatDate(session.createdAt)}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => revoke(session.token)}
                    disabled={pendingToken === session.token}
                  >
                    {pendingToken === session.token ? (
                      <Spinner data-icon="inline-start" />
                    ) : null}
                    Révoquer
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={revokeOtherSessions}
            disabled={revokingOthers}
          >
            {revokingOthers ? <Spinner data-icon="inline-start" /> : null}
            Déconnecter les autres sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
