import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { ChangeEmailForm } from '@/components/auth/change-email-form';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Changer mon adresse email — PreskEnLer',
};

export default async function ChangeEmailPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <ChangeEmailForm currentEmail={session?.user.email} />;
}
