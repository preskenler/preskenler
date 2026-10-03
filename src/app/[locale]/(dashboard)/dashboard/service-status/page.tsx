import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import {
  ServiceStatusList,
  type ServiceStatusRowData,
} from '@/components/dashboard/service-status-list';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getServiceStatusMap } from '@/lib/service-status-store';
import { cityServices } from '@/lib/services';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard.serviceStatus');

  return { title: t('title') };
}

export const dynamic = 'force-dynamic';

export default async function ServiceStatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Dashboard.serviceStatus');
  const tServices = await getTranslations('Public.Services');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect({ href: '/sign-in', locale: locale as AppLocale });
  }

  if (!hasPermission(session.user.role, { serviceStatus: ['list'] })) {
    return redirect({ href: '/dashboard', locale: locale as AppLocale });
  }

  const statusMap = await getServiceStatusMap();
  const rows: ServiceStatusRowData[] = cityServices.map((service) => {
    const current = statusMap.get(service.slug);
    return {
      slug: service.slug,
      name: tServices(`items.${service.slug}.name`),
      status: current?.status ?? 'available',
      message: current?.message ?? null,
      expectedReturn: current?.expectedReturn ?? null,
      alternative: current?.alternative ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted-foreground">
        {t('description')}
      </p>
      <ServiceStatusList rows={rows} />
    </div>
  );
}
