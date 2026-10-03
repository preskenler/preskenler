'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { ADMIN_BAN_REASON, isRole } from '@/lib/roles';

async function requirePermission(permissions: Record<string, string[]>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !hasPermission(session.user.role, permissions)) {
    throw new Error('UNAUTHORIZED');
  }

  return session;
}

/** Change a user's profile (demande D09) through the Better Auth admin plugin. */
export async function updateUserRole(formData: FormData) {
  const session = await requirePermission({ user: ['set-role'] });

  const userId = String(formData.get('userId') ?? '');
  const role = formData.get('role');

  // Refuse unknown roles and self-demotion (which could lock the admin out).
  if (!userId || !isRole(role) || userId === session.user.id) {
    return;
  }

  await auth.api.setRole({
    body: { userId, role },
    headers: await headers(),
  });

  revalidatePath('/dashboard/users');
}

/** Ban or unban a user (demande D09), via the admin plugin. */
export async function toggleUserBan(formData: FormData) {
  const session = await requirePermission({ user: ['ban'] });

  const userId = String(formData.get('userId') ?? '');
  const shouldBan = formData.get('banned') === 'true';

  if (!userId || userId === session.user.id) {
    return;
  }

  const requestHeaders = await headers();

  if (shouldBan) {
    await auth.api.banUser({
      body: { userId, banReason: ADMIN_BAN_REASON },
      headers: requestHeaders,
    });
  } else {
    await auth.api.unbanUser({
      body: { userId },
      headers: requestHeaders,
    });
  }

  revalidatePath('/dashboard/users');
}
