import { describe, expect, it } from 'vitest';

import {
  isAdmin,
  isRole,
  isStaff,
  normalizeRole,
  roleLabels,
  roles,
} from './roles';

describe('roles', () => {
  it('exposes the three profiles with French labels', () => {
    expect(roles).toEqual(['citizen', 'agent', 'admin']);
    expect(roleLabels.citizen).toBe('Citoyen');
  });

  it('recognises known roles only', () => {
    expect(isRole('agent')).toBe(true);
    expect(isRole('superuser')).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });

  it('normalizes unknown values to citizen', () => {
    expect(normalizeRole('admin')).toBe('admin');
    expect(normalizeRole('root')).toBe('citizen');
    expect(normalizeRole(null)).toBe('citizen');
  });

  it('treats agents and admins as staff, citizens as not', () => {
    expect(isStaff('agent')).toBe(true);
    expect(isStaff('admin')).toBe(true);
    expect(isStaff('citizen')).toBe(false);
    expect(isStaff('nope')).toBe(false);
  });

  it('detects admins only', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('agent')).toBe(false);
  });
});
