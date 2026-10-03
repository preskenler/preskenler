'use client';

import { useState } from 'react';
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
import { useRouter } from '@/i18n/navigation';
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
  const t = useTranslations('Account.sessions');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  async function revoke(token: string) {
    setPendingToken(token);
    const { error: revokeError } = await authClient.revokeSession({ token });
    setPendingToken(null);

    if (revokeError) {
      setError(revokeError.message ?? t('revokeError'));
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
      setError(revokeError.message ?? t('revokeOthersError'));
      return;
    }

    setError(null);
    router.refresh();
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

        {sessions.length === 0 ? (
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
