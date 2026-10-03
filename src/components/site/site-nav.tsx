'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/announcements', label: 'Annonces' },
  { href: '/contact', label: 'Contact' },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="flex flex-wrap items-center gap-1 text-sm"
    >
      {links.map((link) => {
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
