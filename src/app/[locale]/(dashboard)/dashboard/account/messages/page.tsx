import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/badge';
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
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account.messages');

  return { title: t('metaTitle') };
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function AccountMessagesPage() {
  const t = await getTranslations('Account.messages');
  const tServices = await getTranslations('Public.Services');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const messages = await prisma.serviceMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-medium">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

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
                    ? t('statusReceived')
                    : t('statusHandled')}
                </Badge>
              </div>
              <CardDescription>{formatDate(message.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pretty whitespace-pre-wrap">
                {message.message}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
