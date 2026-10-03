import { describe, expect, it } from 'vitest';

import {
  buildHeatwaveRecommendations,
  isBroadcastActive,
  sortByPriority,
  toBroadcastView,
  type BroadcastRecord,
} from './broadcasts';

function record(overrides: Partial<BroadcastRecord>): BroadcastRecord {
  return {
    id: 'b1',
    title: 'Titre',
    body: 'Message',
    level: 'info',
    topic: 'general',
    audience: 'all',
    area: null,
    recommendations: null,
    isAi: false,
    active: true,
    publishedAt: new Date('2026-10-01T08:00:00Z'),
    expiresAt: null,
    createdById: null,
    ...overrides,
  };
}

describe('isBroadcastActive', () => {
  const now = new Date('2026-10-03T12:00:00Z');

  it('keeps an active broadcast without expiry', () => {
    expect(isBroadcastActive(record({}), now)).toBe(true);
  });

  it('hides an inactive broadcast', () => {
    expect(isBroadcastActive(record({ active: false }), now)).toBe(false);
  });

  it('hides an expired broadcast', () => {
    expect(
      isBroadcastActive(
        record({ expiresAt: new Date('2026-10-02T12:00:00Z') }),
        now,
      ),
    ).toBe(false);
  });

  it('keeps a broadcast that expires later', () => {
    expect(
      isBroadcastActive(
        record({ expiresAt: new Date('2026-10-04T12:00:00Z') }),
        now,
      ),
    ).toBe(true);
  });
});

describe('sortByPriority', () => {
  const now = new Date('2026-10-03T12:00:00Z');

  it('puts alerts before warnings and info', () => {
    const sorted = sortByPriority(
      [
        record({ id: 'info', level: 'info' }),
        record({ id: 'alert', level: 'alert' }),
        record({ id: 'warning', level: 'warning' }),
      ],
      now,
    );

    expect(sorted.map((item) => item.id)).toEqual(['alert', 'warning', 'info']);
  });

  it('orders the same level by newest first', () => {
    const sorted = sortByPriority(
      [
        record({ id: 'old', publishedAt: new Date('2026-10-01T08:00:00Z') }),
        record({ id: 'new', publishedAt: new Date('2026-10-02T08:00:00Z') }),
      ],
      now,
    );

    expect(sorted.map((item) => item.id)).toEqual(['new', 'old']);
  });
});

describe('buildHeatwaveRecommendations', () => {
  it('returns non-empty advice for every audience', () => {
    for (const audience of ['all', 'citizens', 'vulnerable'] as const) {
      const advice = buildHeatwaveRecommendations(audience);
      expect(advice.length).toBeGreaterThan(0);
      expect(advice.split('\n').length).toBeGreaterThan(1);
    }
  });
});

describe('toBroadcastView', () => {
  it('splits recommendations into cleaned lines', () => {
    const view = toBroadcastView(
      record({ recommendations: 'Ligne 1\n\n Ligne 2 \n' }),
    );

    expect(view.recommendations).toEqual(['Ligne 1', 'Ligne 2']);
  });

  it('returns an empty list without recommendations', () => {
    expect(toBroadcastView(record({})).recommendations).toEqual([]);
  });
});
