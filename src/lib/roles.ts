/**
 * Habitant / agent / administrateur profiles (demandes D08 & D09).
 *
 * The role is owned by the Better Auth admin plugin and stored on the user as
 * a comma-separated list, so several roles can be combined. These helpers keep
 * the checks and French labels in one place; `src/lib/permissions.ts` defines
 * what each role may actually do.
 */

export const roles = ['citizen', 'agent', 'admin'] as const;

export type Role = (typeof roles)[number];

/** Role granted to new accounts (mirrors `defaultRole` in `auth.ts`). */
export const defaultRole: Role = 'citizen';

/**
 * Stable code stored as `banReason` when an admin suspends an account, so the
 * UI can localize the reason instead of persisting display copy.
 */
export const ADMIN_BAN_REASON = 'admin-suspension';

export function isRole(value: unknown): value is Role {
  return (
    typeof value === 'string' && (roles as readonly string[]).includes(value)
  );
}

/** Split the plugin's comma-separated role string into known roles. */
export function parseRoles(value: unknown): Role[] {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter(isRole);
}

export function hasRole(value: unknown, role: Role): boolean {
  return parseRoles(value).includes(role);
}

/** Primary role used for display/badges (admin > agent > citizen). */
export function normalizeRole(value: unknown): Role {
  const parsed = parseRoles(value);

  if (parsed.includes('admin')) {
    return 'admin';
  }

  if (parsed.includes('agent')) {
    return 'agent';
  }

  return 'citizen';
}

export function isStaff(value: unknown): boolean {
  const parsed = parseRoles(value);
  return parsed.includes('agent') || parsed.includes('admin');
}

export function isAdmin(value: unknown): boolean {
  return parseRoles(value).includes('admin');
}

export function getStaffEmailAllowlist(): string[] {
  return (process.env.STAFF_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
