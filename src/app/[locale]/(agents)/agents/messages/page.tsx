import type { Metadata } from 'next';

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
import { prisma } from '@/lib/prisma';
import { getCityService } from '@/lib/services';
import { setMessageStatus } from './actions';

export const metadata: Metadata = {
  title: 'Messages des habitants — PreskEnLer',
};

export const dynamic = 'force-dynamic';

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function StaffMessagesPage() {
  const messages = await prisma.serviceMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const pending = messages.filter((message) => message.status === 'new').length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {pending} message{pending > 1 ? 's' : ''} à traiter sur{' '}
        {messages.length} reçu{messages.length > 1 ? 's' : ''}.
      </p>

      {messages.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Aucun message reçu</EmptyTitle>
            <EmptyDescription>
              Les messages envoyés depuis le formulaire de contact arriveront
              ici.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        messages.map((message) => (
          <Card key={message.id} size="sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>
                  {getCityService(message.service)?.name ?? message.service}
                </CardTitle>
                <Badge
                  variant={message.status === 'new' ? 'default' : 'secondary'}
                >
                  {message.status === 'new' ? 'À traiter' : 'Traité'}
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
                  {message.status === 'new'
                    ? 'Marquer comme traité'
                    : 'Rouvrir'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
