'use client';

import { useTranslations } from 'next-intl';

import { findNavLabelKey } from '@/components/dashboard/dashboard-nav';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link, usePathname } from '@/i18n/navigation';

/**
 * Location marker for the authenticated area (demande D15). Shows the current
 * section under the dashboard home; the overview page needs no trail.
 */
export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('Dashboard');

  if (pathname === '/dashboard') {
    return null;
  }

  const labelKey = findNavLabelKey(pathname);

  return (
    <Breadcrumb aria-label={t('breadcrumb.ariaLabel')}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/dashboard" />}>
            {t('breadcrumb.home')}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{t(`nav.${labelKey}`)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
