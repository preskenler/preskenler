import { describe, expect, it } from 'vitest';

import {
  isProblemCategory,
  isProblemStatus,
  problemCategories,
  serviceForCategory,
} from './reports';

describe('problem reports', () => {
  it('routes every category to a municipal service', () => {
    for (const category of problemCategories) {
      expect(serviceForCategory(category)).toMatch(/^[a-z-]+$/);
    }
  });

  it('maps a broken street lamp to voirie-mobilite', () => {
    expect(serviceForCategory('streetlight')).toBe('voirie-mobilite');
    expect(serviceForCategory('waste')).toBe('proprete-dechets');
  });

  it('validates categories and statuses', () => {
    expect(isProblemCategory('road')).toBe(true);
    expect(isProblemCategory('spaceship')).toBe(false);
    expect(isProblemStatus('in_progress')).toBe(true);
    expect(isProblemStatus('closed')).toBe(false);
  });
});
