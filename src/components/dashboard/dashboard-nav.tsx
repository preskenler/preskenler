import {
  type RemixiconComponentType,
  RiDashboardLine,
  RiUserLine,
  RiMailLine,
  RiListUnordered,
  RiMessage3Line,
  RiGroupLine,
  RiMegaphoneLine,
  RiLockPasswordLine,
  RiMailSettingsLine,
  RiHistoryLine,
  RiDeleteBinLine,
} from '@remixicon/react';

export type DashboardIcon = RemixiconComponentType;

export type DashboardNavItem = {
  href: string;
  /** Key inside the `Dashboard.nav` namespace. */
  labelKey: string;
  icon: DashboardIcon;
  permission?: Record<string, string[]>;
};

/** Primary navigation; items with a permission are hidden when it is not met. */
export const mainNavItems: DashboardNavItem[] = [
  { href: '/dashboard', labelKey: 'overview', icon: RiDashboardLine },
  { href: '/dashboard/account', labelKey: 'account', icon: RiUserLine },
  {
    href: '/dashboard/account/messages',
    labelKey: 'messages',
    icon: RiMailLine,
  },
  {
    href: '/dashboard/requests',
    labelKey: 'requests',
    icon: RiListUnordered,
    permission: { webcupRequest: ['list'] },
  },
  {
    href: '/dashboard/messages',
    labelKey: 'staffMessages',
    icon: RiMessage3Line,
    permission: { serviceMessage: ['list'] },
  },
  {
    href: '/dashboard/broadcasts',
    labelKey: 'broadcasts',
    icon: RiMegaphoneLine,
    permission: { broadcast: ['list'] },
  },
  {
    href: '/dashboard/users',
    labelKey: 'users',
    icon: RiGroupLine,
    permission: { user: ['list'] },
  },
];

/** Secondary account navigation. */
export const secondaryNavItems: DashboardNavItem[] = [
  {
    href: '/dashboard/account/password',
    labelKey: 'password',
    icon: RiLockPasswordLine,
  },
  {
    href: '/dashboard/account/email',
    labelKey: 'email',
    icon: RiMailSettingsLine,
  },
  {
    href: '/dashboard/account/sessions',
    labelKey: 'sessions',
    icon: RiHistoryLine,
  },
  {
    href: '/dashboard/account/delete',
    labelKey: 'delete',
    icon: RiDeleteBinLine,
  },
];

export const allNavItems = [...mainNavItems, ...secondaryNavItems];

/** `/dashboard` only matches exactly so it does not shadow every section. */
export function matchesPath(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Longest matching section, used for the header title. */
export function findNavLabelKey(pathname: string) {
  let match: DashboardNavItem | undefined;

  for (const item of allNavItems) {
    if (
      matchesPath(pathname, item.href) &&
      (match === undefined || item.href.length > match.href.length)
    ) {
      match = item;
    }
  }

  return match?.labelKey ?? 'overview';
}
