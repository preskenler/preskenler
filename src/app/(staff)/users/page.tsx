import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { normalizeRole, roleLabels, roles } from '@/lib/roles';
import { toggleUserBan, updateUserRole } from './actions';

export const metadata: Metadata = {
  title: 'Utilisateurs — PreskEnLer',
};

export const dynamic = 'force-dynamic';

export default async function StaffUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !hasPermission(session.user.role, { user: ['list'] })) {
    redirect('/requests');
  }

  const { users } = await auth.api.listUsers({
    query: { limit: 200 },
    headers: await headers(),
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Attribue les profils citoyen, agent ou administrateur et suspends un
        compte si nécessaire. Les agents accèdent à l’espace de travail ; les
        administrateurs gèrent aussi les profils.
      </p>

      {users.map((user) => {
        const isSelf = user.id === session.user.id;
        const role = normalizeRole(user.role);

        return (
          <Card key={user.id} size="sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{user.name}</CardTitle>
                <Badge variant="outline">{roleLabels[role]}</Badge>
                {user.banned ? (
                  <Badge variant="destructive">Suspendu</Badge>
                ) : null}
              </div>
              <CardDescription>
                {user.email}
                {isSelf ? ' · toi' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex flex-wrap items-end gap-2">
                <form
                  action={updateUserRole}
                  className="flex flex-wrap items-end gap-2"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <NativeSelect
                    name="role"
                    defaultValue={role}
                    className="w-48"
                    aria-label={`Profil de ${user.name}`}
                    disabled={isSelf}
                  >
                    {roles.map((value) => (
                      <NativeSelectOption key={value} value={value}>
                        {roleLabels[value]}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={isSelf}
                  >
                    Mettre à jour
                  </Button>
                </form>

                <form action={toggleUserBan}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input
                    type="hidden"
                    name="banned"
                    value={user.banned ? 'false' : 'true'}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant={user.banned ? 'outline' : 'destructive'}
                    disabled={isSelf}
                  >
                    {user.banned ? 'Réactiver' : 'Suspendre'}
                  </Button>
                </form>
              </div>

              {user.banned && user.banReason ? (
                <p className="text-xs text-muted-foreground">
                  Motif : {user.banReason}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
