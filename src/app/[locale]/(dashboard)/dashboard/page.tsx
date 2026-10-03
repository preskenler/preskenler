import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { ActivityChart } from '@/components/dashboard/activity-chart';
import { AppointmentReminder } from '@/components/dashboard/appointment-reminder';
import { AttentionCard } from '@/components/dashboard/attention-card';
import { DashboardTable } from '@/components/dashboard/data-table';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { StatCards } from '@/components/dashboard/stat-cards';
import { Badge } from '@/components/ui/badge';
import { getUpcomingWithin } from '@/lib/appointments';
import { getUserAppointments } from '@/lib/appointment-store';
import { auth } from '@/lib/auth';
import { toBroadcastView } from '@/lib/broadcasts';
import { getActiveBroadcasts } from '@/lib/broadcast-store';
import { getCitizenDashboard, getStaffDashboard } from '@/lib/dashboard';
import { hasPermission } from '@/lib/permissions';
import { normalizeRole, parseRoles } from '@/lib/roles';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');

  return { title: t('metaTitle') };
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard');
  const tServices = await getTranslations('Public.Services');
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const { user } = session;

  if (hasPermission(user.role, { user: ['set-role'] })) {
    const [staff, { users }] = await Promise.all([
      getStaffDashboard(),
      auth.api.listUsers({ query: { limit: 200 }, headers: await headers() }),
    ]);

    const agentCount = users.filter((candidate) =>
      parseRoles(candidate.role).some(
        (role) => role === 'agent' || role === 'admin',
      ),
    ).length;
    const bannedCount = users.filter((candidate) => candidate.banned).length;

    return (
      <>
        <StatCards
          cards={[
            { title: t('cards.users'), value: users.length },
            { title: t('cards.agents'), value: agentCount },
            { title: t('cards.banned'), value: bannedCount },
            {
              title: t('cards.pendingMessages'),
              value: staff.pendingMessages,
            },
          ]}
        />

        <ActivityChart
          title={t('chart.staffTitle')}
          description={t('chart.staffDescription')}
          data={staff.series}
        />

        <DashboardTable
          title={t('table.usersTitle')}
          description={t('table.usersDescription')}
          columns={[
            { key: 'name', label: t('table.columns.name') },
            { key: 'email', label: t('table.columns.email') },
            { key: 'role', label: t('table.columns.role') },
            {
              key: 'status',
              label: t('table.columns.accountStatus'),
              align: 'end',
            },
          ]}
          rows={users.slice(0, 8).map((candidate) => ({
            id: candidate.id,
            cells: {
              name: candidate.name,
              email: candidate.email,
              role: t(`roles.${normalizeRole(candidate.role)}`),
              status: (
                <Badge variant={candidate.banned ? 'destructive' : 'secondary'}>
                  {candidate.banned
                    ? t('table.accountBanned')
                    : t('table.accountActive')}
                </Badge>
              ),
            },
          }))}
          emptyTitle={t('table.emptyTitle')}
          emptyDescription={t('table.emptyDescription')}
        />
      </>
    );
  }

  if (
    hasPermission(user.role, { webcupRequest: ['list'] }) ||
    hasPermission(user.role, { serviceMessage: ['list'] })
  ) {
    const staff = await getStaffDashboard();

    return (
      <>
        <StatCards
          cards={[
            {
              title: t('cards.visibleRequests'),
              value: staff.session?.visibleRequestsCount ?? staff.requestCount,
              hint: t('cards.visibleRequestsHint'),
            },
            { title: t('cards.totalRequests'), value: staff.requestCount },
            {
              title: t('cards.pendingMessages'),
              value: staff.pendingMessages,
            },
            {
              title: t('cards.currentWave'),
              value: staff.session?.currentWave ?? 0,
              hint: staff.session?.isRunning
                ? t('cards.sessionRunning')
                : t('cards.sessionStopped'),
            },
          ]}
        />

        <ActivityChart
          title={t('chart.staffTitle')}
          description={t('chart.staffDescription')}
          data={staff.series}
        />

        <DashboardTable
          title={t('table.requestsTitle')}
          description={t('table.requestsDescription')}
          columns={[
            { key: 'code', label: t('table.columns.code') },
            { key: 'requester', label: t('table.columns.requester') },
            { key: 'difficulty', label: t('table.columns.difficulty') },
            {
              key: 'wave',
              label: t('table.columns.wave'),
              align: 'end',
            },
            { key: 'xp', label: t('table.columns.xp'), align: 'end' },
          ]}
          rows={staff.requests.map((request) => ({
            id: request.requestCode,
            cells: {
              code: request.requestCode,
              requester: request.requesterName,
              difficulty: <Badge variant="outline">{request.difficulty}</Badge>,
              wave: request.waveNumber ?? '—',
              xp: request.xpTotal,
            },
          }))}
          emptyTitle={t('table.emptyTitle')}
          emptyDescription={t('table.emptyDescription')}
        />
      </>
    );
  }

  const citizen = await getCitizenDashboard(user.id);
  const alerts = (await getActiveBroadcasts()).map(toBroadcastView);
  // In-app appointment reminder (demande F40): surface the next booking within
  // 72 hours without waiting for the email channel.
  const upcomingAppointments = getUpcomingWithin(
    await getUserAppointments(user.id),
  );

  return (
    <>
      <OnboardingChecklist
        emailVerified={user.emailVerified}
        hasMessages={citizen.total > 0}
      />

      <AttentionCard pendingMessages={citizen.pending} alerts={alerts} />

      <AppointmentReminder appointments={upcomingAppointments} />

      <StatCards
        cards={[
          { title: t('cards.sentMessages'), value: citizen.total },
          { title: t('cards.handledMessages'), value: citizen.handled },
          { title: t('cards.pendingMessages'), value: citizen.pending },
          {
            title: t('cards.emailStatus'),
            value: user.emailVerified
              ? t('cards.verified')
              : t('cards.notVerified'),
          },
        ]}
      />

      <ActivityChart
        title={t('chart.citizenTitle')}
        description={t('chart.citizenDescription')}
        data={citizen.series}
      />

      <DashboardTable
        title={t('table.citizenTitle')}
        description={t('table.citizenDescription')}
        columns={[
          { key: 'service', label: t('table.columns.service') },
          { key: 'status', label: t('table.columns.status') },
          { key: 'date', label: t('table.columns.date'), align: 'end' },
        ]}
        rows={citizen.messages.slice(0, 8).map((message) => ({
          id: message.id,
          cells: {
            service: tServices.has(`items.${message.service}.name`)
              ? tServices(`items.${message.service}.name`)
              : message.service,
            status: (
              <Badge
                variant={message.status === 'new' ? 'default' : 'secondary'}
              >
                {message.status === 'new'
                  ? t('table.statusNew')
                  : t('table.statusHandled')}
              </Badge>
            ),
            date: formatDateTime(message.createdAt),
          },
        }))}
        emptyTitle={t('table.emptyTitle')}
        emptyDescription={t('table.emptyDescription')}
      />
    </>
  );
}
