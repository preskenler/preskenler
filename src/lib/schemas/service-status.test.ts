import { describe, expect, it } from 'vitest';

import { createServiceStatusSchema } from './service-status';

const schema = createServiceStatusSchema((key) => key);

const valid = {
  service: 'eau-assainissement',
  status: 'maintenance',
  message: 'Maintenance jusqu’à demain matin.',
  expectedReturn: '2026-01-02T08:00',
  alternative: 'Contacte la voirie pour les urgences.',
};

describe('serviceStatusSchema', () => {
  it('accepts a complete update', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('accepts an available service without details', () => {
    expect(
      schema.safeParse({
        service: 'etat-civil',
        status: 'available',
        message: '',
        expectedReturn: '',
        alternative: '',
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(schema.safeParse({ ...valid, status: 'closed' }).success).toBe(
      false,
    );
  });
});
