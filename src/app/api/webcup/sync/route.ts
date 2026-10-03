import { syncWebcup } from '@/lib/webcup/sync';

export const dynamic = 'force-dynamic';

/**
 * Bearer secret protecting the sync route. Accepts the app's own secret or
 * Vercel's `CRON_SECRET` so the same route works on cPanel cron or Vercel Cron.
 */
function isAuthorized(request: Request): boolean {
  const secret =
    process.env.WEBCUP_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  return request.headers.get('authorization') === `Bearer ${secret}`;
}

/**
 * Pull the latest demands from the Terra Nova API into MySQL. Called by an
 * external scheduler (cPanel cron every minute), never by the browser.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const snapshot = await syncWebcup();

    return Response.json({
      ok: true,
      fetchedAt: snapshot.fetchedAt,
      session: snapshot.session,
      visibleRequests: snapshot.requests.length,
      newCodes: snapshot.newCodes,
    });
  } catch (error) {
    console.error('[webcup] scheduled sync failed', error);
    return Response.json(
      { ok: false, error: 'Service Webcup indisponible.' },
      { status: 502 },
    );
  }
}
