'use client';

import type { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { RiGalleryLine } from '@remixicon/react';

import { Link, usePathname } from '@/i18n/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/dashboard/nav-main';
import { NavSecondary } from '@/components/dashboard/nav-secondary';
import { NavUser, type NavUserProfile } from '@/components/dashboard/nav-user';
import {
  mainNavItems,
  matchesPath,
  secondaryNavItems,
  type DashboardNavItem,
} from '@/components/dashboard/dashboard-nav';
import { hasPermission } from '@/lib/permissions';

export function AppSidebar({
  role,
  user,
  ...props
}: Omit<ComponentProps<typeof Sidebar>, 'role'> & {
  role: string | null | undefined;
  user: NavUserProfile;
}) {
  const t = useTranslations('Dashboard');
  const pathname = usePathname();

  function visibleItems(items: DashboardNavItem[]) {
    return items
      .filter(
        (item) => !item.permission || hasPermission(role, item.permission),
      )
      .map((item) => ({
        ...item,
        label: t(`nav.${item.labelKey}`),
        isActive: matchesPath(pathname, item.href),
      }));
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <RiGalleryLine className="size-4" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold">{t('brand')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleItems(mainNavItems)} />
        <NavSecondary
          items={visibleItems(secondaryNavItems)}
          label={t('nav.secondary')}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
