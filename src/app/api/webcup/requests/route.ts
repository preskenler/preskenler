import { headers } from 'next/headers';
import { after } from 'next/server';

import { auth } from '@/lib/auth';
import { readWebcupSnapshot, syncWebcup } from '@/lib/webcup/sync';

// The board polls this route; never cache the answer.
export const dynamic = 'force-dynamic';

/**
 * Authenticated snapshot of the persisted Terra Nova demands.
 *
 * The response is read from the database so it stays fast, while a background
 * `after()` sync refreshes it from the API so the next poll is up to date.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  after(async () => {
    try {
      await syncWebcup();
    } catch (error) {
      console.error('[webcup] background sync failed', error);
    }
  });

  try {
    const snapshot = await readWebcupSnapshot();
    return Response.json(snapshot);
  } catch (error) {
    console.error('[webcup] snapshot read failed', error);
    return Response.json(
      { error: 'Demandes indisponibles pour le moment.' },
      { status: 502 },
    );
  }
}
