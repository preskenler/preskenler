'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin, isRole } from '@/lib/roles';

/** Change a user's profile (demande D09). Admins only. */
export async function updateUserRole(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !isAdmin(session.user.role)) {
    throw new Error('Non autorisé.');
  }

  const userId = String(formData.get('userId') ?? '');
  const role = formData.get('role');

  if (!userId || !isRole(role)) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath('/users');
}
