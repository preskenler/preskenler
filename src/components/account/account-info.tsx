'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type AccountInfoUser = {
  name: string;
  email: string;
  emailVerified: boolean;
};

export function AccountInfo({ user }: { user: AccountInfoUser }) {
  const t = useTranslations('Account.info');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t('name')}</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t('email')}</dt>
            <dd className="flex items-center gap-2 font-medium">
              {user.email}
              {user.emailVerified ? (
                <Badge variant="secondary">{t('verified')}</Badge>
              ) : (
                <Badge variant="outline">{t('notVerified')}</Badge>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
