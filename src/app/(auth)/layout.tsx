import type { ReactNode } from 'react';
import Link from 'next/link';
import { GalleryVerticalEndIcon } from 'lucide-react';

import { AppBackground } from '@/components/app-background';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 text-foreground md:p-10">
      <AppBackground />

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          PreskEnLer
        </Link>
        {children}
      </div>
    </main>
  );
}
