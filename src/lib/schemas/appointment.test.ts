import { describe, expect, it } from 'vitest';

import { createAppointmentSchema, createSlotSchema } from './appointment';

const schema = createAppointmentSchema((key) => key);
const slotSchema = createSlotSchema((key) => key);

const valid = {
  slotId: 'slot-1',
  name: 'Alex Habitant',
  email: 'alex@terranova.city',
  phone: '',
  reason: 'Renouvellement de ma carte d’identité.',
};

describe('appointmentSchema', () => {
  it('accepts a complete booking', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('requires a slot and a reason', () => {
    expect(schema.safeParse({ ...valid, slotId: '' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, reason: 'x' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(schema.safeParse({ ...valid, email: 'nope' }).success).toBe(false);
  });
});

describe('slotSchema', () => {
  const slot = {
    service: 'etat-civil',
    startsAt: '2026-01-02T10:00',
    durationMinutes: '30',
    agentName: '',
    location: '',
    capacity: '1',
  };

  it('coerces numeric fields', () => {
    const result = slotSchema.parse(slot);
    expect(result.durationMinutes).toBe(30);
    expect(result.capacity).toBe(1);
  });

  it('rejects out-of-range duration and capacity', () => {
    expect(
      slotSchema.safeParse({ ...slot, durationMinutes: '5' }).success,
    ).toBe(false);
    expect(slotSchema.safeParse({ ...slot, capacity: '0' }).success).toBe(
      false,
    );
  });
});
