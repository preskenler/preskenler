import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { DeleteAccountForm } from '@/components/auth/delete-account-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account');

  return { title: t('delete.metaTitle') };
}

export default function DeleteAccountPage() {
  return <DeleteAccountForm />;
}
