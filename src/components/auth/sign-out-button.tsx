'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut();
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={pending}
    >
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {t('signOut')}
    </Button>
  );
}
