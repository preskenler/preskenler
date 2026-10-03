import { describe, expect, it } from 'vitest';

import { contactSchema } from './contact';

describe('contactSchema', () => {
  const valid = {
    name: 'Alex Habitant',
    email: 'alex@terranova.city',
    service: 'proprete-dechets',
    message: 'Les poubelles de ma rue n’ont pas été collectées cette semaine.',
  };

  it('accepts a complete message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'nope' });
    expect(result.success).toBe(false);
  });

  it('requires a service and a long enough message', () => {
    expect(contactSchema.safeParse({ ...valid, service: '' }).success).toBe(
      false,
    );
    expect(
      contactSchema.safeParse({ ...valid, message: 'court' }).success,
    ).toBe(false);
  });

  it('trims the fields before validating', () => {
    const result = contactSchema.parse({
      ...valid,
      name: '  Alex  ',
      message: `   ${valid.message}   `,
    });

    expect(result.name).toBe('Alex');
    expect(result.message).toBe(valid.message);
  });
});
