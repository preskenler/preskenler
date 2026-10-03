/**
 * General messages and alerts broadcast to residents (demandes D18, F29, F30
 * and F31). Staff publish them from `/dashboard/broadcasts`; residents see the
 * active ones as a banner, through the notification bell and on `/alerts`.
 *
 * Pure constants, types and helpers only: client components import this module,
 * so it must never reach for the database. Queries live in `./broadcast-store`.
 */

export const broadcastLevels = ['info', 'warning', 'alert'] as const;
export type BroadcastLevel = (typeof broadcastLevels)[number];

export const broadcastTopics = [
  'general',
  'flood',
  'heatwave',
  'health',
  'transport',
  'announcement',
] as const;
export type BroadcastTopic = (typeof broadcastTopics)[number];

export const broadcastAudiences = ['all', 'citizens', 'vulnerable'] as const;
export type BroadcastAudience = (typeof broadcastAudiences)[number];

export type BroadcastRecord = {
  id: string;
  title: string;
  body: string;
  level: BroadcastLevel;
  topic: BroadcastTopic;
  audience: BroadcastAudience;
  area: string | null;
  recommendations: string | null;
  isAi: boolean;
  active: boolean;
  publishedAt: Date;
  expiresAt: Date | null;
  createdById: string | null;
};

/** Result of the staff broadcast form, shared by the action and its client form. */
export type BroadcastFormState = {
  status: 'idle' | 'error' | 'success';
  error?: string;
};

/** Serializable shape handed to client components (banner, bell). */
export type BroadcastView = {
  id: string;
  level: BroadcastLevel;
  topic: BroadcastTopic;
  audience: BroadcastAudience;
  title: string;
  body: string;
  area: string | null;
  recommendations: string[];
  isAi: boolean;
};

export function toBroadcastView(record: BroadcastRecord): BroadcastView {
  return {
    id: record.id,
    level: record.level,
    topic: record.topic,
    audience: record.audience,
    title: record.title,
    body: record.body,
    area: record.area,
    recommendations: record.recommendations
      ? record.recommendations
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : [],
    isAi: record.isAi,
  };
}

/** Higher wins when several alerts are active at once. */
const LEVEL_RANK: Record<BroadcastLevel, number> = {
  info: 0,
  warning: 1,
  alert: 2,
};

function isLevel(value: string): value is BroadcastLevel {
  return (broadcastLevels as readonly string[]).includes(value);
}

function isTopic(value: string): value is BroadcastTopic {
  return (broadcastTopics as readonly string[]).includes(value);
}

function isAudience(value: string): value is BroadcastAudience {
  return (broadcastAudiences as readonly string[]).includes(value);
}

export type BroadcastRow = {
  id: string;
  title: string;
  body: string;
  level: string;
  topic: string;
  audience: string;
  area: string | null;
  recommendations: string | null;
  isAi: boolean;
  active: boolean;
  publishedAt: Date;
  expiresAt: Date | null;
  createdById: string | null;
};

export function toBroadcastRecord(row: BroadcastRow): BroadcastRecord {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    level: isLevel(row.level) ? row.level : 'info',
    topic: isTopic(row.topic) ? row.topic : 'general',
    audience: isAudience(row.audience) ? row.audience : 'all',
    area: row.area,
    recommendations: row.recommendations,
    isAi: row.isAi,
    active: row.active,
    publishedAt: row.publishedAt,
    expiresAt: row.expiresAt,
    createdById: row.createdById,
  };
}

/** An active broadcast is flagged active and not past its expiry date. */
export function isBroadcastActive(
  record: Pick<BroadcastRecord, 'active' | 'expiresAt'>,
  now: Date = new Date(),
): boolean {
  if (!record.active) {
    return false;
  }

  return !record.expiresAt || record.expiresAt.getTime() > now.getTime();
}

/** Alerts first, then the most recent message. */
export function sortByPriority(
  records: BroadcastRecord[],
  now: Date = new Date(),
): BroadcastRecord[] {
  return [...records].sort((left, right) => {
    const rank = LEVEL_RANK[right.level] - LEVEL_RANK[left.level];

    if (rank !== 0) {
      return rank;
    }

    const freshness =
      (isBroadcastActive(right, now) ? 1 : 0) -
      (isBroadcastActive(left, now) ? 1 : 0);

    if (freshness !== 0) {
      return freshness;
    }

    return right.publishedAt.getTime() - left.publishedAt.getTime();
  });
}

const HEATWAVE_RECOMMENDATIONS: Record<BroadcastAudience, string[]> = {
  vulnerable: [
    'Bois de l’eau régulièrement, même sans avoir soif.',
    'Reste dans les pièces les plus fraîches et ferme les volets le jour.',
    'Évite de sortir entre 11 h et 18 h ; porte un chapeau et des vêtements clairs.',
    'Prends des nouvelles de tes proches isolés ou fragiles.',
    'En cas de malaise, contacte le 15 ou le 112.',
  ],
  all: [
    'Bois de l’eau régulièrement tout au long de la journée.',
    'Ferme les volets et stores pendant les heures les plus chaudes.',
    'Privilégie les sorties tôt le matin ou en soirée.',
    'Pense à vérifier comment vont tes voisins âgés.',
  ],
  citizens: [
    'Bois de l’eau régulièrement tout au long de la journée.',
    'Aère tôt le matin, puis ferme les fenêtres le jour.',
    'Prends des nouvelles des personnes fragiles de ton entourage.',
  ],
};

/**
 * Curated, audience-specific heatwave advice (demande F31). Acts as the
 * AI-assist fallback: the same content is produced whether or not an external
 * model is configured, so the alert is always actionable.
 */
export function buildHeatwaveRecommendations(
  audience: BroadcastAudience,
): string {
  return HEATWAVE_RECOMMENDATIONS[audience].join('\n');
}
