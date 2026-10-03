'use client';

import { useTranslations } from 'next-intl';
import { RiExternalLinkLine } from '@remixicon/react';

import { Link, usePathname } from '@/i18n/navigation';
import { DisplayPreferences } from '@/components/accessibility/display-preferences';
import {
  NotificationBell,
  type BroadcastNotification,
} from '@/components/dashboard/notification-bell';
import { LocaleSwitcher } from '@/components/public/locale-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { findNavLabelKey } from '@/components/dashboard/dashboard-nav';

export function SiteHeader({
  notifications,
}: {
  notifications: BroadcastNotification[];
}) {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();
  const title = t(`nav.${findNavLabelKey(pathname)}`);

  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell items={notifications} />
          <LocaleSwitcher />
          <DisplayPreferences />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <span className="hidden sm:inline">{t('nav.portal')}</span>
            <RiExternalLinkLine aria-hidden="true" data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </header>
  );
}
