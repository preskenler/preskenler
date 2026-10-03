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
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { normalizeRole, roles, ADMIN_BAN_REASON } from '@/lib/roles';
import { toggleUserBan, updateUserRole } from './actions';
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin.users');

  return { title: t('metaTitle') };
}

export const dynamic = 'force-dynamic';

export default async function StaffUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Admin.users');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  if (!hasPermission(session.user.role, { user: ['list'] })) {
    return redirect({ href: '/dashboard', locale: locale as AppLocale });
  }

  const { users } = await auth.api.listUsers({
    query: { limit: 200 },
    headers: await headers(),
  });

  // Admins manage every account; agents (F34) only see and administer citizens.
  const canManageRoles = hasPermission(session.user.role, {
    user: ['set-role'],
  });
  const canBan = hasPermission(session.user.role, { user: ['ban'] });
  const visibleUsers = canManageRoles
    ? users
    : users.filter((candidate) => normalizeRole(candidate.role) === 'citizen');

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t('description')}</p>

      {visibleUsers.map((user) => {
        const isSelf = user.id === session.user.id;
        const role = normalizeRole(user.role);
        const banReason =
          user.banReason === ADMIN_BAN_REASON
            ? t('banReasonAdmin')
            : user.banReason;

        return (
          <Card key={user.id} size="sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{user.name}</CardTitle>
                <Badge variant="outline">{t(`roles.${role}`)}</Badge>
                {user.banned ? (
                  <Badge variant="destructive">{t('banned')}</Badge>
                ) : null}
              </div>
              <CardDescription>
                {user.email}
                {isSelf ? ` · ${t('you')}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex flex-wrap items-end gap-2">
                {canManageRoles ? (
                  <form
                    action={updateUserRole}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <NativeSelect
                      name="role"
                      defaultValue={role}
                      className="w-48"
                      aria-label={t('roleLabel', { name: user.name })}
                      disabled={isSelf}
                    >
                      {roles.map((value) => (
                        <NativeSelectOption key={value} value={value}>
                          {t(`roles.${value}`)}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      disabled={isSelf}
                    >
                      {t('update')}
                    </Button>
                  </form>
                ) : (
                  <Badge variant="outline">{t(`roles.${role}`)}</Badge>
                )}

                {canBan ? (
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
                      {user.banned ? t('reactivate') : t('suspend')}
                    </Button>
                  </form>
                ) : null}
              </div>

              {user.banned && banReason ? (
                <p className="text-xs text-muted-foreground">
                  {t('reason', { reason: banReason })}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
