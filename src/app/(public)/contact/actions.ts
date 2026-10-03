'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { contactSchema, type ContactValues } from '@/lib/schemas/contact';

export type ContactActionResult = { error?: string };

/**
 * Store a message addressed to a municipal service (demande D04).
 *
 * The client already validated the form; re-validate here at the server
 * boundary before writing. The message is linked to the signed-in user when
 * one is available.
 */
export async function submitServiceMessage(
  values: ContactValues,
): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(values);

  if (!parsed.success) {
    return { error: 'Merci de vérifier les informations du formulaire.' };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    await prisma.serviceMessage.create({
      data: {
        ...parsed.data,
        userId: session?.user.id ?? null,
      },
    });

    return {};
  } catch (error) {
    console.error('[contact] failed to store service message', error);
    return { error: 'Envoi impossible pour le moment. Réessaie plus tard.' };
  }
}
