import type { CSSProperties, ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { DashboardBreadcrumbs } from '@/components/dashboard/dashboard-breadcrumbs';
import { SiteHeader } from '@/components/dashboard/site-header';
import { BroadcastBanner } from '@/components/public/broadcast-banner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Session } from '@/lib/auth';
import { toBroadcastView } from '@/lib/broadcasts';
import { getActiveBroadcasts } from '@/lib/broadcast-store';
import { normalizeRole } from '@/lib/roles';

/**
 * Shared shell for every authenticated area: the sidebar navigation is filtered
 * per role/permission and stays mounted across citizen, agent and admin pages.
 */
export async function DashboardShell({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) {
  const t = await getTranslations('Dashboard');
  const role = normalizeRole(session.user.role);
  const broadcasts = await getActiveBroadcasts();
  // The bell notifies for important messages (warning/alert); routine info
  // still shows in the banner (demande F30).
  const notifications = broadcasts
    .filter((broadcast) => broadcast.level !== 'info')
    .map((broadcast) => ({
      id: broadcast.id,
      level: broadcast.level,
      title: broadcast.title,
    }));

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar
        role={session.user.role}
        user={{
          name: session.user.name,
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          roleLabel: t(`roles.${role}`),
          image: session.user.image,
        }}
      />
      <SidebarInset id="contenu">
        <SiteHeader notifications={notifications} />
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <DashboardBreadcrumbs />
            <BroadcastBanner items={broadcasts.map(toBroadcastView)} />
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
