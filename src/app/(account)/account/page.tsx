import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Mon compte — PreskEnLer',
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du compte</CardTitle>
        <CardDescription>
          Détails de ton compte et état de vérification de ton adresse email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Nom</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Adresse email</dt>
            <dd className="flex items-center gap-2 font-medium">
              {user.email}
              {user.emailVerified ? (
                <Badge variant="secondary">Vérifiée</Badge>
              ) : (
                <Badge variant="outline">Non vérifiée</Badge>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
