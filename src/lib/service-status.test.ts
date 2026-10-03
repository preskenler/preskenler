import { describe, expect, it } from 'vitest';

import {
  isServiceAvailabilityStatus,
  isServiceUnavailable,
} from './service-status';

describe('service availability', () => {
  it('only treats available as usable', () => {
    expect(isServiceUnavailable('available')).toBe(false);
    expect(isServiceUnavailable('maintenance')).toBe(true);
    expect(isServiceUnavailable('incident')).toBe(true);
  });

  it('guards the status union', () => {
    expect(isServiceAvailabilityStatus('incident')).toBe(true);
    expect(isServiceAvailabilityStatus('closed')).toBe(false);
    expect(isServiceAvailabilityStatus(42)).toBe(false);
  });
});
