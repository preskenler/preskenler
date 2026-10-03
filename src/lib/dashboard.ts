import { prisma } from '@/lib/prisma';

export type ActivityPoint = {
  /** Local calendar day, `YYYY-MM-DD`. */
  date: string;
  value: number;
};

const CHART_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDaysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (days - 1));
  return date;
}

/** Local day key so chart buckets line up with the browser's timezone. */
function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildSeries(dates: Date[], days = CHART_DAYS): ActivityPoint[] {
  const start = startOfDaysAgo(days);
  const buckets = new Map<string, number>();

  for (let index = 0; index < days; index += 1) {
    buckets.set(toDayKey(new Date(start.getTime() + index * DAY_MS)), 0);
  }

  for (const date of dates) {
    const key = toDayKey(date);

    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return [...buckets].map(([date, value]) => ({ date, value }));
}

/** Citizen overview: their contact messages and recent activity. */
export async function getCitizenDashboard(userId: string) {
  const since = startOfDaysAgo(CHART_DAYS);

  const [messages, recent] = await Promise.all([
    prisma.serviceMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        service: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.serviceMessage.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  return {
    total: messages.length,
    handled: messages.filter((message) => message.status !== 'new').length,
    pending: messages.filter((message) => message.status === 'new').length,
    messages,
    series: buildSeries(recent.map((message) => message.createdAt)),
  };
}

/** Agent/admin overview: the live Terra Nova feed plus message triage. */
export async function getStaffDashboard() {
  const since = startOfDaysAgo(CHART_DAYS);

  const [session, requestCount, requests, pendingMessages, recentRequests] =
    await Promise.all([
      prisma.webcupSession.findUnique({ where: { id: 'current' } }),
      prisma.webcupRequest.count(),
      prisma.webcupRequest.findMany({
        orderBy: [{ sortOrder: 'asc' }, { requestCode: 'asc' }],
        take: 8,
        select: {
          requestCode: true,
          requesterName: true,
          difficulty: true,
          waveNumber: true,
          xpTotal: true,
        },
      }),
      prisma.serviceMessage.count({ where: { status: 'new' } }),
      prisma.webcupRequest.findMany({
        where: { firstSeenAt: { gte: since } },
        select: { firstSeenAt: true },
      }),
    ]);

  return {
    session,
    requestCount,
    requests,
    pendingMessages,
    series: buildSeries(recentRequests.map((request) => request.firstSeenAt)),
  };
}
