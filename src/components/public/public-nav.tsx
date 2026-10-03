'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/services', key: 'services' },
  { href: '/transport', key: 'transport' },
  { href: '/announcements', key: 'announcements' },
  { href: '/alerts', key: 'alerts' },
  { href: '/contact', key: 'contact' },
] as const;

export function PublicNav() {
  const t = useTranslations('Public.Nav');
  const pathname = usePathname();

  return (
    <nav
      aria-label={t('ariaLabel')}
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
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
