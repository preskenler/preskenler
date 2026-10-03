import { describe, expect, it } from 'vitest';

import {
  getUpcomingWithin,
  isSlotBookable,
  type AppointmentSlotView,
  type AppointmentView,
} from './appointments';

function slot(
  overrides: Partial<AppointmentSlotView> = {},
): AppointmentSlotView {
  return {
    id: 'slot-1',
    service: 'etat-civil',
    startsAt: new Date('2026-01-02T10:00:00.000Z').toISOString(),
    durationMinutes: 30,
    agentName: null,
    location: null,
    capacity: 1,
    bookedCount: 0,
    remaining: 1,
    ...overrides,
  };
}

function appointment(
  overrides: Partial<AppointmentView> = {},
): AppointmentView {
  return {
    id: 'appointment-1',
    reference: 'RDV-ABCDEFGH',
    userId: 'user-1',
    service: 'etat-civil',
    slotId: 'slot-1',
    startsAt: new Date('2026-01-02T10:00:00.000Z').toISOString(),
    durationMinutes: 30,
    agentName: null,
    location: null,
    name: 'Ada',
    email: 'ada@example.com',
    phone: null,
    reason: 'Renouvellement de papiers',
    status: 'booked',
    reminderSentAt: null,
    createdAt: new Date('2025-12-20T10:00:00.000Z').toISOString(),
    ...overrides,
  };
}

describe('appointments', () => {
  it('marks a future slot with room as bookable', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    expect(isSlotBookable(slot(), now)).toBe(true);
    expect(isSlotBookable(slot({ remaining: 0 }), now)).toBe(false);
    expect(
      isSlotBookable(slot({ startsAt: '2025-12-31T00:00:00.000Z' }), now),
    ).toBe(false);
  });

  it('keeps only booked appointments inside the reminder window', () => {
    const now = new Date();
    const inTwelveHours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = getUpcomingWithin(
      [
        appointment({ id: 'soon', startsAt: inTwelveHours.toISOString() }),
        appointment({ id: 'far', startsAt: inFiveDays.toISOString() }),
        appointment({ id: 'past', startsAt: yesterday.toISOString() }),
        appointment({
          id: 'cancelled',
          startsAt: inTwelveHours.toISOString(),
          status: 'cancelled',
        }),
      ],
      72 * 60 * 60 * 1000,
    );

    expect(result.map((item) => item.id)).toEqual(['soon']);
  });
});
