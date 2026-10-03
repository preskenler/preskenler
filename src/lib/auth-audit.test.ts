import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    authAuditLog: {
      findMany: mocks.findMany,
      create: mocks.create,
    },
  },
}));

import { getSecurityOverview, recordAuthAuditEvent } from './auth-audit';

function log(
  email: string,
  outcome: 'success' | 'failure',
  ipAddress: string | null = null,
  minutesAgo = 0,
) {
  return {
    id: `${email}-${outcome}-${minutesAgo}`,
    email,
    outcome,
    ipAddress,
    createdAt: new Date(Date.now() - minutesAgo * 60 * 1000),
  };
}

describe('getSecurityOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('flags accounts past the failure threshold and addresses hitting several accounts', async () => {
    mocks.findMany.mockResolvedValue([
      ...Array.from({ length: 5 }, (_, index) =>
        log('a@terranova.city', 'failure', '1.2.3.4', index),
      ),
      ...Array.from({ length: 4 }, (_, index) =>
        log('b@terranova.city', 'failure', '1.2.3.4', index + 10),
      ),
      ...Array.from({ length: 4 }, (_, index) =>
        log('c@terranova.city', 'failure', '1.2.3.4', index + 20),
      ),
      log('d@terranova.city', 'success', '5.6.7.8', 1),
    ]);

    const overview = await getSecurityOverview(24);

    expect(overview.totalAttempts).toBe(14);
    expect(overview.failures).toBe(13);
    expect(overview.accounts.map((account) => account.email)).toEqual([
      'a@terranova.city',
    ]);
    expect(overview.addresses).toHaveLength(1);
    expect(overview.addresses[0]).toMatchObject({
      ipAddress: '1.2.3.4',
      failures: 13,
      accounts: 3,
    });
  });

  it('returns empty alerts when activity is normal', async () => {
    mocks.findMany.mockResolvedValue([
      log('a@terranova.city', 'success'),
      log('a@terranova.city', 'failure', '1.2.3.4', 1),
    ]);

    const overview = await getSecurityOverview(24);

    expect(overview.failures).toBe(1);
    expect(overview.accounts).toHaveLength(0);
    expect(overview.addresses).toHaveLength(0);
  });
});

describe('recordAuthAuditEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes the email and truncates long fields', async () => {
    mocks.create.mockResolvedValue({});

    await recordAuthAuditEvent({
      event: 'sign-in',
      outcome: 'failure',
      email: 'ADA@Terranova.City',
      ipAddress: '1.2.3.4',
      userAgent: 'a'.repeat(600),
    });

    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        event: 'sign-in',
        outcome: 'failure',
        email: 'ada@terranova.city',
        userId: null,
        ipAddress: '1.2.3.4',
        userAgent: 'a'.repeat(500),
      },
    });
  });

  it('never throws when the database write fails', async () => {
    mocks.create.mockRejectedValue(new Error('db down'));

    await expect(
      recordAuthAuditEvent({
        event: 'sign-in',
        outcome: 'success',
        email: 'ada@terranova.city',
      }),
    ).resolves.toBeUndefined();
  });
});
