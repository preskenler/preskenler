import { describe, expect, it } from 'vitest';

import { cityServices, getCityService, getFeaturedServices } from './services';

describe('services catalogue', () => {
  it('highlights a handful of priority services', () => {
    const featured = getFeaturedServices();

    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((service) => service.featured)).toBe(true);
    expect(featured.map((service) => service.slug)).toContain('etat-civil');
  });

  it('finds a service by slug', () => {
    expect(getCityService('voirie-mobilite')?.category).toBe(
      'services-techniques',
    );
    expect(getCityService('inconnu')).toBeNull();
  });

  it('keeps slugs unique', () => {
    const slugs = new Set(cityServices.map((service) => service.slug));
    expect(slugs.size).toBe(cityServices.length);
  });
});
