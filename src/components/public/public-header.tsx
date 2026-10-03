import { RiGalleryLine } from '@remixicon/react';
import { useTranslations } from 'next-intl';

import { DisplayPreferences } from '@/components/accessibility/display-preferences';
import { LocaleSwitcher } from '@/components/public/locale-switcher';
import { PublicNav } from '@/components/public/public-nav';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { Session } from '@/lib/auth';

export function PublicHeader({ session }: { session: Session | null }) {
  const t = useTranslations('Public.Header');

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <RiGalleryLine className="size-4" />
          </span>
          PreskEnLer
        </Link>

        <PublicNav />

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <DisplayPreferences />
          {session ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/account" />}
            >
              {t('account')}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                {t('signIn')}
              </Button>
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                {t('signUp')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
