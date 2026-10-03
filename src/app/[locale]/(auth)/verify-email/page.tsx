import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { VerifyEmailPanel } from '@/components/auth/verify-email-panel';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth.verify');

  return { title: t('metaTitle') };
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailPanel />
    </Suspense>
  );
}
