import { describe, expect, it } from 'vitest';

import { createReportSchema } from './report';

const schema = createReportSchema((key) => key);

const valid = {
  name: 'Alex Habitant',
  email: 'alex@terranova.city',
  category: 'streetlight',
  location: '12 rue des Fondateurs',
  description: 'Le lampadaire devant l’école ne fonctionne plus depuis lundi.',
};

describe('reportSchema', () => {
  it('accepts a complete report', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('requires a known category', () => {
    expect(schema.safeParse({ ...valid, category: 'spaceship' }).success).toBe(
      false,
    );
  });

  it('requires a location and a long enough description', () => {
    expect(schema.safeParse({ ...valid, location: 'a' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, description: 'court' }).success).toBe(
      false,
    );
  });

  it('trims the fields before validating', () => {
    const result = schema.parse({
      ...valid,
      name: '  Alex  ',
      description: `   ${valid.description}   `,
    });

    expect(result.name).toBe('Alex');
    expect(result.description).toBe(valid.description);
  });
});
