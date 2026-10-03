'use client';

import { Link } from '@/i18n/navigation';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { DashboardNavItem } from '@/components/dashboard/dashboard-nav';

export type NavMainItem = DashboardNavItem & {
  label: string;
  isActive: boolean;
};

export function NavMain({ items }: { items: NavMainItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={item.isActive}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
