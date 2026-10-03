'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isStaff } from '@/lib/roles';

/**
 * Toggle a citizen message between "new" and "handled" (demande F22).
 * Restricted to agents and admins.
 */
export async function setMessageStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !isStaff(session.user.role)) {
    throw new Error('Non autorisé.');
  }

  const id = String(formData.get('id') ?? '');
  const status = formData.get('status') === 'handled' ? 'handled' : 'new';

  if (!id) {
    return;
  }

  await prisma.serviceMessage.update({
    where: { id },
    data: { status },
  });

  revalidatePath('/messages');
}
