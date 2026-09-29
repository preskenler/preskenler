import Link from 'next/link';

import { SignOutButton } from '@/components/auth/sign-out-button';

const links = [
  { href: '/account', label: 'Compte' },
  { href: '/change-password', label: 'Mot de passe' },
  { href: '/change-email', label: 'Email' },
  { href: '/sessions', label: 'Sessions' },
];

export function AccountNav() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-2.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <SignOutButton />
    </div>
  );
}
