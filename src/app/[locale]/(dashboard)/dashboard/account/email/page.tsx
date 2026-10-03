import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { ChangeEmailForm } from '@/components/auth/change-email-form';
import { auth } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account');

  return { title: t('emailChange.metaTitle') };
}

export default async function ChangeEmailPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <ChangeEmailForm currentEmail={session?.user.email} />;
}
