import { describe, expect, it } from 'vitest';

import {
  hasRole,
  isAdmin,
  isRole,
  isStaff,
  normalizeRole,
  parseRoles,
  roles,
} from './roles';
import { hasPermission } from './permissions';

describe('roles', () => {
  it('exposes the three profiles', () => {
    expect(roles).toEqual(['citizen', 'agent', 'admin']);
  });

  it('recognises known roles only', () => {
    expect(isRole('agent')).toBe(true);
    expect(isRole('superuser')).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });

  it('parses the plugin comma-separated role list', () => {
    expect(parseRoles('citizen,agent')).toEqual(['citizen', 'agent']);
    expect(parseRoles('agent, unknown')).toEqual(['agent']);
    expect(parseRoles(null)).toEqual([]);
    expect(hasRole('citizen,agent', 'agent')).toBe(true);
    expect(hasRole('citizen', 'agent')).toBe(false);
  });

  it('picks the strongest role for display', () => {
    expect(normalizeRole('admin')).toBe('admin');
    expect(normalizeRole('citizen,agent')).toBe('agent');
    expect(normalizeRole('agent,admin')).toBe('admin');
    expect(normalizeRole('root')).toBe('citizen');
  });

  it('treats agents and admins as staff, citizens as not', () => {
    expect(isStaff('agent')).toBe(true);
    expect(isStaff('citizen,admin')).toBe(true);
    expect(isStaff('citizen')).toBe(false);
  });

  it('detects admins only', () => {
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('citizen,agent')).toBe(false);
  });
});

describe('hasPermission', () => {
  it('lets agents list and update service messages', () => {
    expect(hasPermission('agent', { serviceMessage: ['list'] })).toBe(true);
    expect(hasPermission('agent', { serviceMessage: ['update'] })).toBe(true);
    expect(hasPermission('agent', { webcupRequest: ['list'] })).toBe(true);
  });

  it('denies citizens the staff resources', () => {
    expect(hasPermission('citizen', { serviceMessage: ['list'] })).toBe(false);
    expect(hasPermission('citizen', { webcupRequest: ['list'] })).toBe(false);
    expect(hasPermission('citizen', { user: ['list'] })).toBe(false);
  });

  it('lets agents administer citizen accounts but not roles (F34)', () => {
    expect(hasPermission('agent', { user: ['list'] })).toBe(true);
    expect(hasPermission('agent', { user: ['ban'] })).toBe(true);
    expect(hasPermission('agent', { user: ['set-role'] })).toBe(false);
    expect(hasPermission('admin', { user: ['list'] })).toBe(true);
    expect(hasPermission('admin', { user: ['set-role'] })).toBe(true);
    expect(hasPermission('admin', { user: ['ban'] })).toBe(true);
  });

  it('lets staff publish broadcasts, not citizens (D18/F29/F31)', () => {
    expect(hasPermission('agent', { broadcast: ['create'] })).toBe(true);
    expect(hasPermission('agent', { broadcast: ['update'] })).toBe(true);
    expect(hasPermission('admin', { broadcast: ['delete'] })).toBe(true);
    expect(hasPermission('citizen', { broadcast: ['list'] })).toBe(false);
  });

  it('combines permissions from several roles', () => {
    expect(hasPermission('citizen,agent', { serviceMessage: ['list'] })).toBe(
      true,
    );
    expect(hasPermission('citizen,admin', { user: ['set-role'] })).toBe(true);
  });
});
