import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

import { parseRoles } from '@/lib/roles';

/**
 * Single source of truth for profiles and permissions (demandes D08 & D09).
 *
 * Built on the Better Auth admin plugin: `citizen`, `agent` and `admin` are
 * declared here, shared by the server (`src/lib/auth.ts`) and the client
 * (`src/lib/auth-client.ts`). `defaultStatements` brings the plugin's `user`
 * and `session` resources; the app adds its own resources below.
 */
export const statement = {
  ...defaultStatements,
  serviceMessage: ['list', 'update'],
  webcupRequest: ['list'],
  broadcast: ['list', 'create', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

/** Habitants: no administrative capabilities. */
export const citizen = ac.newRole({});

/**
 * Agents: the staff area — live demands, citizen message triage and citizen
 * account administration (demande F34). They may list and suspend citizen
 * accounts, but not touch roles or other staff members.
 */
export const agent = ac.newRole({
  user: ['list', 'ban'],
  serviceMessage: ['list', 'update'],
  webcupRequest: ['list'],
  broadcast: ['list', 'create', 'update', 'delete'],
});

/** Administrators: full user/session management plus the staff area. */
export const admin = ac.newRole({
  ...adminAc.statements,
  serviceMessage: ['list', 'update'],
  webcupRequest: ['list'],
  broadcast: ['list', 'create', 'update', 'delete'],
});

export const appRoles = { citizen, agent, admin };

/**
 * Synchronous permission check that mirrors the admin plugin's `hasPermission`:
 * every role held by the user is tested against the requested permissions.
 * Keeps route and server-action guards free of extra round-trips.
 */
export function hasPermission(
  role: unknown,
  permissions: Record<string, string[]>,
): boolean {
  return parseRoles(role).some(
    (parsed) => appRoles[parsed].authorize(permissions).success,
  );
}
