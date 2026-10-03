'use client';

import { useTranslations } from 'next-intl';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link, usePathname } from '@/i18n/navigation';
import { getAnnouncement } from '@/lib/announcements';

type Crumb = { href: string; label: string };

/** Top-level public routes and the `Public.Nav` key that labels them. */
const topLevelRoutes: Record<string, string> = {
  '/services': 'services',
  '/transport': 'transport',
  '/announcements': 'announcements',
  '/alerts': 'alerts',
  '/contact': 'contact',
  '/reports': 'reports',
  '/appointments': 'appointments',
};

/**
 * Location marker for the public portal (demande D15): helps residents tell
 * which part of the platform they are in and step back to a parent level. The
 * home page has no trail, so the component renders nothing there.
 */
export function PublicBreadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('Public.Breadcrumb');
  const tNav = useTranslations('Public.Nav');
  const tAnnouncements = useTranslations('Public.Announcements');

  const crumbs: Crumb[] = [];

  if (pathname.startsWith('/announcements/')) {
    const slug = pathname.slice('/announcements/'.length);
    crumbs.push({ href: '/announcements', label: tNav('announcements') });
    if (getAnnouncement(slug)) {
      crumbs.push({
        href: pathname,
        label: tAnnouncements(`items.${slug}.title`),
      });
    }
  } else if (topLevelRoutes[pathname]) {
    crumbs.push({ href: pathname, label: tNav(topLevelRoutes[pathname]) });
  }

  if (pathname === '/' || crumbs.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-6">
      <Breadcrumb aria-label={t('ariaLabel')}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>
              {t('home')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb) => {
            const isLast = crumb.href === crumbs[crumbs.length - 1]?.href;
            return (
              <BreadcrumbItem key={crumb.href}>
                <BreadcrumbSeparator />
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
