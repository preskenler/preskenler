/**
 * Habitant / agent / administrateur profiles (demandes D08 & D09).
 *
 * The role lives on the `user` row and is surfaced on the Better Auth session.
 * `STAFF_EMAILS` bootstraps agents on sign-up; an admin can then adjust roles
 * from the staff area.
 */

export const roles = ['citizen', 'agent', 'admin'] as const;

export type Role = (typeof roles)[number];

export const roleLabels: Record<Role, string> = {
  citizen: 'Citoyen',
  agent: 'Agent municipal',
  admin: 'Administrateur',
};

export function isRole(value: unknown): value is Role {
  return (
    typeof value === 'string' && (roles as readonly string[]).includes(value)
  );
}

/** Never trust the raw value: anything unknown falls back to `citizen`. */
export function normalizeRole(value: unknown): Role {
  return isRole(value) ? value : 'citizen';
}

export function isStaff(role: unknown): boolean {
  const normalized = normalizeRole(role);
  return normalized === 'agent' || normalized === 'admin';
}

export function isAdmin(role: unknown): boolean {
  return normalizeRole(role) === 'admin';
}

export function getStaffEmailAllowlist(): string[] {
  return (process.env.STAFF_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
