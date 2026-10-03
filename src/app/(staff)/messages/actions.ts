'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

/**
 * Toggle a citizen message between "new" and "handled" (demande F22).
 * Restricted to roles that may update service messages.
 */
export async function setMessageStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    !hasPermission(session.user.role, { serviceMessage: ['update'] })
  ) {
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
