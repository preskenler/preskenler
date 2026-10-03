import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { setMessageStatus } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Agents.messages');

  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function StaffMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Agents.messages');
  const tServices = await getTranslations('Public.Services');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  if (!hasPermission(session.user.role, { serviceMessage: ['list'] })) {
    return redirect({ href: '/dashboard', locale: locale as AppLocale });
  }

  const messages = await prisma.serviceMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const pending = messages.filter((message) => message.status === 'new').length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('summary', { pending, total: messages.length })}
      </p>

      {messages.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        messages.map((message) => (
          <Card key={message.id} size="sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  {tServices.has(`items.${message.service}.name`)
                    ? tServices(`items.${message.service}.name`)
                    : message.service}
                </CardTitle>
                <Badge
                  variant={message.status === 'new' ? 'default' : 'secondary'}
                >
                  {message.status === 'new'
                    ? t('statusNew')
                    : t('statusHandled')}
                </Badge>
              </div>
              <CardDescription>
                {message.name} · {message.email} ·{' '}
                {formatDate(message.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-pretty whitespace-pre-wrap">
                {message.message}
              </p>
              <form action={setMessageStatus} className="w-fit">
                <input type="hidden" name="id" value={message.id} />
                <input
                  type="hidden"
                  name="status"
                  value={message.status === 'new' ? 'handled' : 'new'}
                />
                <Button type="submit" size="sm" variant="outline">
                  {message.status === 'new' ? t('markHandled') : t('reopen')}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
