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
import { prisma } from '@/lib/prisma';
import { isAdmin, normalizeRole, roleLabels, roles } from '@/lib/roles';
import { updateUserRole } from './actions';

export const metadata: Metadata = {
  title: 'Utilisateurs — PreskEnLer',
};

export const dynamic = 'force-dynamic';

export default async function StaffUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !isAdmin(session.user.role)) {
    redirect('/requests');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    take: 200,
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Attribue les profils citoyen, agent ou administrateur. Les agents
        accèdent à l’espace de travail ; les administrateurs gèrent aussi les
        profils.
      </p>

      {users.map((user) => (
        <Card key={user.id} size="sm">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{user.name}</CardTitle>
              <Badge variant="outline">
                {roleLabels[normalizeRole(user.role)]}
              </Badge>
            </div>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={updateUserRole}
              className="flex flex-wrap items-end gap-2"
            >
              <input type="hidden" name="userId" value={user.id} />
              <NativeSelect
                name="role"
                defaultValue={normalizeRole(user.role)}
                className="w-48"
                aria-label={`Profil de ${user.name}`}
              >
                {roles.map((role) => (
                  <NativeSelectOption key={role} value={role}>
                    {roleLabels[role]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button type="submit" size="sm" variant="outline">
                Mettre à jour
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
