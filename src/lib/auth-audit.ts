import { prisma } from '@/lib/prisma';

/**
 * Sign-in security trail (demande F37). The cybersecurity centre uses these
 * rows to spot an unusual number of attempts across several accounts. Writes
 * are best-effort: a logging failure must never break authentication.
 */

export type AuthAuditOutcome = 'success' | 'failure';

export type AuthAuditEntry = {
  event: string;
  outcome: AuthAuditOutcome;
  email: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function recordAuthAuditEvent(entry: AuthAuditEntry) {
  try {
    await prisma.authAuditLog.create({
      data: {
        event: entry.event.slice(0, 32),
        outcome: entry.outcome,
        email: entry.email.slice(0, 191).toLowerCase(),
        userId: entry.userId ?? null,
        ipAddress: entry.ipAddress?.slice(0, 64) ?? null,
        userAgent: entry.userAgent?.slice(0, 500) ?? null,
      },
    });
  } catch (error) {
    console.error('[auth-audit] failed to record event', error);
  }
}

/** A user account with repeated failures inside the observation window. */
export type SecurityAccountAlert = {
  email: string;
  failures: number;
  lastAt: string;
};

/** A source address hitting several accounts. */
export type SecurityAddressAlert = {
  ipAddress: string;
  failures: number;
  accounts: number;
  lastAt: string;
};

export type SecurityOverview = {
  windowHours: number;
  totalAttempts: number;
  failures: number;
  accounts: SecurityAccountAlert[];
  addresses: SecurityAddressAlert[];
  recent: {
    id: string;
    email: string;
    outcome: AuthAuditOutcome;
    ipAddress: string | null;
    createdAt: string;
  }[];
};

/** A single account with this many failures is worth a look. */
export const SUSPICIOUS_FAILURE_THRESHOLD = 5;
/** An address touching this many distinct accounts is worth a look. */
export const SUSPICIOUS_ACCOUNT_SPREAD = 3;

export async function getSecurityOverview(
  windowHours = 24,
): Promise<SecurityOverview> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const logs = await prisma.authAuditLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  const accounts = new Map<string, { failures: number; lastAt: Date }>();
  const addresses = new Map<
    string,
    { failures: number; lastAt: Date; accounts: Set<string> }
  >();
  let failures = 0;

  for (const log of logs) {
    if (log.outcome === 'success') {
      continue;
    }

    failures += 1;
    const account = accounts.get(log.email);
    if (account) {
      account.failures += 1;
      if (log.createdAt > account.lastAt) {
        account.lastAt = log.createdAt;
      }
    } else {
      accounts.set(log.email, { failures: 1, lastAt: log.createdAt });
    }

    if (log.ipAddress) {
      const address = addresses.get(log.ipAddress);
      if (address) {
        address.failures += 1;
        address.accounts.add(log.email);
        if (log.createdAt > address.lastAt) {
          address.lastAt = log.createdAt;
        }
      } else {
        addresses.set(log.ipAddress, {
          failures: 1,
          lastAt: log.createdAt,
          accounts: new Set([log.email]),
        });
      }
    }
  }

  return {
    windowHours,
    totalAttempts: logs.length,
    failures,
    accounts: [...accounts.entries()]
      .filter(([, value]) => value.failures >= SUSPICIOUS_FAILURE_THRESHOLD)
      .map(([email, value]) => ({
        email,
        failures: value.failures,
        lastAt: value.lastAt.toISOString(),
      }))
      .sort((a, b) => b.failures - a.failures),
    addresses: [...addresses.entries()]
      .filter(
        ([, value]) =>
          value.failures >= SUSPICIOUS_FAILURE_THRESHOLD &&
          value.accounts.size >= SUSPICIOUS_ACCOUNT_SPREAD,
      )
      .map(([ipAddress, value]) => ({
        ipAddress,
        failures: value.failures,
        accounts: value.accounts.size,
        lastAt: value.lastAt.toISOString(),
      }))
      .sort((a, b) => b.failures - a.failures),
    recent: logs.slice(0, 50).map((log) => ({
      id: log.id,
      email: log.email,
      outcome: log.outcome === 'success' ? 'success' : 'failure',
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}
