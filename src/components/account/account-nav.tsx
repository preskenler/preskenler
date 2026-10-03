'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { cn } from '@/lib/utils';

const links = [
  { href: '/account', label: 'Compte' },
  { href: '/account/messages', label: 'Messages' },
  { href: '/change-password', label: 'Mot de passe' },
  { href: '/change-email', label: 'Email' },
  { href: '/sessions', label: 'Sessions' },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="Navigation du compte"
        className="flex flex-wrap items-center gap-2 text-sm"
      >
        {links.map((link) => {
          const active = pathname === link.href;

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
      <SignOutButton />
    </div>
  );
}
