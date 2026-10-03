import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SignInForm } from '@/components/auth/sign-in-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth.signIn');

  return { title: t('metaTitle') };
}

export default function SignInPage() {
  return <SignInForm />;
}
