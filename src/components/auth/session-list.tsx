'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RiComputerLine } from '@remixicon/react';

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

export function SessionList() {
  const t = useTranslations('Account.sessions');
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await authClient.listSessions();
    setLoading(false);

    if (loadError) {
      setError(loadError.message ?? t('loadError'));
      return;
    }

    setError(null);
    setSessions(data ?? []);
  }, [t]);

  useEffect(() => {
    let active = true;

    void authClient.listSessions().then(({ data, error: loadError }) => {
      if (!active) {
        return;
      }

      setLoading(false);

      if (loadError) {
        setError(loadError.message ?? t('loadError'));
        return;
      }

      setError(null);
      setSessions(data ?? []);
    });

    return () => {
      active = false;
    };
  }, [t]);

  async function revoke(token: string) {
    setPendingToken(token);
    const { error: revokeError } = await authClient.revokeSession({ token });
    setPendingToken(null);

    if (revokeError) {
      setError(revokeError.message ?? t('revokeError'));
      return;
    }

    await reload();
  }

  async function revokeOtherSessions() {
    setRevokingOthers(true);
    const { error: revokeError } = await authClient.revokeOtherSessions();
    setRevokingOthers(false);

    if (revokeError) {
      setError(revokeError.message ?? t('revokeOthersError'));
      return;
    }

    await reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Spinner aria-hidden="true" />
            {t('loading')}
          </p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ItemGroup>
            {sessions.map((session) => (
              <Item key={session.id} variant="outline">
                <ItemMedia variant="icon">
                  <RiComputerLine aria-hidden="true" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {session.userAgent || t('unknownDevice')}
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
                    {t('revoke')}
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
            {t('revokeOthers')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
