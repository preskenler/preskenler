import Link from 'next/link';
import { RiGalleryLine } from '@remixicon/react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import type { Session } from '@/lib/auth';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/announcements', label: 'Annonces' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ session }: { session: Session | null }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <RiGalleryLine className="size-4" />
          </span>
          PreskEnLer
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/account" />}
            >
              Mon compte
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Se connecter
              </Button>
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                Créer un compte
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
