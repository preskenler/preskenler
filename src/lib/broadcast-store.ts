import {
  sortByPriority,
  toBroadcastRecord,
  type BroadcastRecord,
} from '@/lib/broadcasts';
import { prisma } from '@/lib/prisma';

/**
 * Database access for broadcast messages and alerts (demandes D18, F29, F30,
 * F31). Kept apart from `./broadcasts` so client components only pull in the
 * pure constants/types and never the Prisma client.
 */

/** Broadcasts that are flagged active and not past their expiry date. */
export async function getActiveBroadcasts(): Promise<BroadcastRecord[]> {
  const now = new Date();
  const rows = await prisma.broadcast.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { publishedAt: 'desc' },
  });

  return sortByPriority(rows.map(toBroadcastRecord), now);
}

/** Every broadcast, active or not, for the staff board. */
export async function getAllBroadcasts(): Promise<BroadcastRecord[]> {
  const rows = await prisma.broadcast.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  return rows.map(toBroadcastRecord);
}
