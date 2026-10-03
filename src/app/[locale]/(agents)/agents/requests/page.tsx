import type { Metadata } from 'next';

import { RequestsBoard } from '@/components/agents/requests-board';
import { readWebcupSnapshot, syncWebcup } from '@/lib/webcup/sync';
import type { WebcupSnapshot } from '@/lib/webcup/types';

export const metadata: Metadata = {
  title: 'Demandes Terra Nova — PreskEnLer',
};

// Always render from the live feed, never from a cached render.
export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  let snapshot: WebcupSnapshot;
  let error: string | null = null;

  try {
    snapshot = await syncWebcup();
  } catch (syncError) {
    console.error('[webcup] initial sync failed', syncError);
    error = 'Connexion à l’API Terra Nova impossible.';
    snapshot = await readWebcupSnapshot();
  }

  return <RequestsBoard initial={snapshot} initialError={error} />;
}
