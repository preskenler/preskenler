import { prisma } from '@/lib/prisma';
import { getWebcupApiResponse } from './client';
import { computeNewCodes, toRequestData, toSessionData } from './map';
import type {
  WebcupRequestView,
  WebcupSessionView,
  WebcupSnapshot,
} from './types';

type WebcupRequestRecord = {
  requestCode: string;
  remoteId: number;
  requesterName: string;
  requesterType: string;
  messagePublic: string;
  difficulty: string;
  difficultyLevel: number;
  xpBase: number;
  xpTimeBonus: number;
  xpTotal: number;
  xpAvailable: number;
  isInitial: boolean;
  visibleSinceWave: number;
  arrivalType: string;
  waveNumber: number | null;
  arrivalTime: string;
  groupName: string | null;
  sortOrder: number | null;
  isAiRelated: boolean;
  isAiRequest: boolean;
  firstSeenAt: Date;
  lastSyncedAt: Date;
};

type WebcupSessionRecord = {
  status: string;
  isRunning: boolean;
  currentWave: number;
  elapsedMinutes: number;
  visibleRequestsCount: number;
  initialRequestsCount: number;
  waveRequestsCount: number;
  nextWaveNumber: number;
  minutesUntilNextWave: number;
  updatedAt: Date;
};

function toRequestView(record: WebcupRequestRecord): WebcupRequestView {
  return {
    requestCode: record.requestCode,
    remoteId: record.remoteId,
    requesterName: record.requesterName,
    requesterType: record.requesterType,
    messagePublic: record.messagePublic,
    difficulty: record.difficulty,
    difficultyLevel: record.difficultyLevel,
    xpBase: record.xpBase,
    xpTimeBonus: record.xpTimeBonus,
    xpTotal: record.xpTotal,
    xpAvailable: record.xpAvailable,
    isInitial: record.isInitial,
    visibleSinceWave: record.visibleSinceWave,
    arrivalType: record.arrivalType,
    waveNumber: record.waveNumber,
    arrivalTime: record.arrivalTime,
    groupName: record.groupName,
    sortOrder: record.sortOrder,
    isAiRelated: record.isAiRelated,
    isAiRequest: record.isAiRequest,
    firstSeenAt: record.firstSeenAt.toISOString(),
    lastSyncedAt: record.lastSyncedAt.toISOString(),
  };
}

function toSessionView(record: WebcupSessionRecord): WebcupSessionView {
  return {
    status: record.status,
    isRunning: record.isRunning,
    currentWave: record.currentWave,
    elapsedMinutes: record.elapsedMinutes,
    visibleRequestsCount: record.visibleRequestsCount,
    initialRequestsCount: record.initialRequestsCount,
    waveRequestsCount: record.waveRequestsCount,
    nextWaveNumber: record.nextWaveNumber,
    minutesUntilNextWave: record.minutesUntilNextWave,
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Read the persisted snapshot without touching the upstream API. */
export async function readWebcupSnapshot(): Promise<WebcupSnapshot> {
  const [session, requests] = await Promise.all([
    prisma.webcupSession.findUnique({ where: { id: 'current' } }),
    prisma.webcupRequest.findMany({
      orderBy: [{ sortOrder: 'asc' }, { requestCode: 'asc' }],
    }),
  ]);

  return {
    session: session ? toSessionView(session) : null,
    requests: requests.map(toRequestView),
    newCodes: [],
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch the API, persist the session and every visible demand, and report which
 * `request_code`s were seen for the first time. Upserts key on `request_code`
 * so repeated polls never create duplicates.
 */
export async function syncWebcup(): Promise<WebcupSnapshot> {
  const data = await getWebcupApiResponse();
  const fetched = data.requests;

  const existing = await prisma.webcupRequest.findMany({
    select: { requestCode: true },
  });

  const newCodes = computeNewCodes(
    fetched.map((request) => request.request_code),
    existing.map((record) => record.requestCode),
  );

  const sessionValues = toSessionData(data.session);

  await prisma.$transaction([
    prisma.webcupSession.upsert({
      where: { id: 'current' },
      create: { id: 'current', ...sessionValues },
      update: sessionValues,
    }),
    ...fetched.map((request) =>
      prisma.webcupRequest.upsert({
        where: { requestCode: request.request_code },
        create: {
          requestCode: request.request_code,
          ...toRequestData(request),
        },
        update: toRequestData(request),
      }),
    ),
  ]);

  const snapshot = await readWebcupSnapshot();
  return { ...snapshot, newCodes };
}
