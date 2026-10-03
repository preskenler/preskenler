'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { hasPermission } from '@/lib/permissions';
import { cn } from '@/lib/utils';

type StaffLink = {
  href: string;
  label: string;
  permission: Record<string, string[]>;
};

const links: StaffLink[] = [
  {
    href: '/agents/requests',
    label: 'Demandes',
    permission: { webcupRequest: ['list'] },
  },
  {
    href: '/agents/messages',
    label: 'Messages',
    permission: { serviceMessage: ['list'] },
  },
  {
    href: '/admin/users',
    label: 'Utilisateurs',
    permission: { user: ['list'] },
  },
];

export function StaffNav({
  role,
  label,
}: {
  role: string | null | undefined;
  label: string;
}) {
  const pathname = usePathname();
  const visible = links.filter((link) => hasPermission(role, link.permission));

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      {visible.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-md px-2.5 py-1 transition-colors hover:bg-muted hover:text-foreground',
              active ? 'bg-muted text-foreground' : 'text-muted-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
