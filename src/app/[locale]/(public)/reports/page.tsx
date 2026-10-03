import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { ReportForm } from '@/components/public/report-form';
import { auth } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Public.Reports');

  return {
    title: t('metaTitle'),
  };
}

export default async function ReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const t = await getTranslations('Public.Reports');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-pretty text-muted-foreground">{t('description')}</p>
      </header>

      <ReportForm
        defaultName={session?.user.name ?? ''}
        defaultEmail={session?.user.email ?? ''}
      />
    </div>
  );
}
