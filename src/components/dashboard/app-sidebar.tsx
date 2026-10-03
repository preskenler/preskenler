'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { RiGalleryLine } from '@remixicon/react';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
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
import { NavUser, type NavUserProfile } from '@/components/dashboard/nav-user';
import {
  AccountDialog,
  isAccountSection,
  type AccountSection,
} from '@/components/dashboard/account-dialog';
import {
  mainNavItems,
  matchesPath,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<{
    open: boolean;
    section: AccountSection;
  }>({ open: false, section: 'info' });

  // Deep links such as `/dashboard?account=sessions` (legacy redirects, the
  // email-change callback) open the account dialog on the requested section,
  // then drop the query param so a refresh does not reopen it. This is a
  // one-shot sync from the URL, not state derived during render.
  useEffect(() => {
    const requested = searchParams.get('account');

    if (requested && isAccountSection(requested)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- consuming a URL deep link
      setAccount({ open: true, section: requested });
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  function openAccount() {
    setAccount((current) => ({ ...current, open: true }));
  }

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
    <>
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
          <NavMain
            items={visibleItems(mainNavItems)}
            onOpenAccount={openAccount}
          />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} onOpenAccount={openAccount} />
        </SidebarFooter>
      </Sidebar>

      <AccountDialog
        open={account.open}
        onOpenChange={(open) => setAccount((current) => ({ ...current, open }))}
        section={account.section}
        onSectionChange={(section) =>
          setAccount((current) => ({ ...current, section }))
        }
        user={user}
      />
    </>
  );
}
